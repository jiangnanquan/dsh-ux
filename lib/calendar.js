/**
 * 中国法定节假日年度日历：自动获取 → 解析 → 缓存。
 *
 * 用途只有一个：DeepSeek 峰谷计费里「法定节假日全天按空闲价」和「下一次切换」
 * 需要知道某一天是不是中国法定节假日。放假安排每年由国务院办公厅发布，所以这里
 * 不写死年份，由 host 半在运行时按年拉取、解析并缓存，跨年无需人工改代码。
 *
 * 数据源（按顺序尝试，都是同一份机读数据的不同传输通道）：
 *   · jsDelivr CDN           https://cdn.jsdelivr.net/gh/NateScarlet/holiday-cn@master/<year>.json
 *   · jsDelivr fastly 镜像   https://fastly.jsdelivr.net/gh/NateScarlet/holiday-cn@master/<year>.json
 *   · GitHub raw             https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/<year>.json
 * holiday-cn 是按国务院办公厅通知维护的 JSON（`papers` 字段保留原通知链接），
 * 格式为 `{ year, papers, days: [{ name, date, isOffDay }] }`。
 *
 * 缓存：
 *   · 内存 Map；
 *   · 磁盘 ~/.dsh/dsh-enhance/calendar-<year>.json（可用 DSH_HOME 覆盖根目录）。
 * 刷新策略：
 *   · 往年日历视为不可变，命中即不再请求；
 *   · 当年与次年每 7 天刷新一次（次年放假安排在年末才发布，空数据会被视为「尚未发布」）；
 *   · 获取失败 30 分钟内不重试，退回磁盘缓存 / 内置 2026 表 / 空表；
 *   · 内置 2026 表只作离线与首启动兜底，正常情况下会被自动获取的数据覆盖。
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

/** 内置兜底表（2026 年，国务院办公厅《关于 2026 年部分节假日安排的通知》）。 */
export const BUILTIN_OFF_DAYS = {
  2026: [
    '2026-01-01', '2026-01-02', '2026-01-03',
    '2026-02-15', '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19',
    '2026-02-20', '2026-02-21', '2026-02-22', '2026-02-23',
    '2026-04-04', '2026-04-05', '2026-04-06',
    '2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04', '2026-05-05',
    '2026-06-19', '2026-06-20', '2026-06-21',
    '2026-09-25', '2026-09-26', '2026-09-27',
    '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05',
    '2026-10-06', '2026-10-07',
  ],
}

const BEIJING_OFFSET_MS = 8 * 3600 * 1000
const REFRESH_MS = 7 * 24 * 3600 * 1000
const RETRY_MS = 30 * 60 * 1000
const FETCH_TIMEOUT_MS = 8000
const MIN_OFF_DAYS = 10
const MAX_YEAR_OFFSET = 1
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export const CALENDAR_SOURCES = [
  (year) => 'https://cdn.jsdelivr.net/gh/NateScarlet/holiday-cn@master/' + year + '.json',
  (year) => 'https://fastly.jsdelivr.net/gh/NateScarlet/holiday-cn@master/' + year + '.json',
  (year) => 'https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/' + year + '.json',
]

const memory = new Map()
const failures = new Map()
const inflight = new Map()

function beijingYear(nowMs) {
  return new Date(nowMs + BEIJING_OFFSET_MS).getUTCFullYear()
}

function builtinEntry(year) {
  const days = BUILTIN_OFF_DAYS[year]
  if (!Array.isArray(days) || days.length === 0) return null
  return { year, offDays: days.slice(), source: 'builtin', fetchedAt: 0, stale: true }
}

function emptyEntry(year, reason) {
  return { year, offDays: [], source: 'unavailable', fetchedAt: 0, stale: true, error: reason }
}

function cacheDirOf(options) {
  if (options && typeof options.cacheDir === 'string' && options.cacheDir !== '') return options.cacheDir
  const home = typeof process !== 'undefined' && process.env && process.env.DSH_HOME
    ? process.env.DSH_HOME
    : join(homedir(), '.dsh')
  return join(home, 'dsh-enhance')
}

function cacheFileOf(year, options) {
  return join(cacheDirOf(options), 'calendar-' + year + '.json')
}

function readDiskCache(year, options) {
  try {
    const raw = JSON.parse(readFileSync(cacheFileOf(year, options), 'utf8'))
    if (raw === null || typeof raw !== 'object' || Number(raw.year) !== year) return null
    if (!Array.isArray(raw.offDays) || raw.offDays.length < MIN_OFF_DAYS) return null
    const offDays = raw.offDays.filter((date) => typeof date === 'string' && DATE_RE.test(date))
    if (offDays.length < MIN_OFF_DAYS) return null
    return {
      year,
      offDays: offDays.slice().sort(),
      source: typeof raw.source === 'string' ? raw.source : 'disk-cache',
      fetchedAt: Number(raw.fetchedAt) || 0,
      papers: Array.isArray(raw.papers) ? raw.papers.filter((url) => typeof url === 'string') : [],
      stale: true,
    }
  } catch (_) {
    return null
  }
}

function writeDiskCache(entry, options) {
  try {
    mkdirSync(cacheDirOf(options), { recursive: true })
    writeFileSync(cacheFileOf(entry.year, options), JSON.stringify({
      year: entry.year,
      offDays: entry.offDays,
      source: entry.source,
      fetchedAt: entry.fetchedAt,
      papers: entry.papers || [],
    }))
  } catch (_) {
    // 缓存写失败不影响判定：内存里这份仍然有效。
  }
}

function getEntry(year, options) {
  if (memory.has(year)) return memory.get(year)
  const entry = readDiskCache(year, options) || builtinEntry(year)
  if (entry !== null) memory.set(year, entry)
  return entry
}

/**
 * 解析 holiday-cn 的 JSON。
 * 只收 `isOffDay: true` 的日期；调休上班日（isOffDay:false）不是节假日，不收录。
 * `days` 为空视为「该年安排尚未发布」——抛错而不是当成「没有节假日」。
 */
export function parseHolidayPayload(payload, year) {
  const target = Number(year)
  if (!Number.isInteger(target) || target < 2000 || target > 2100) throw new Error('非法年份: ' + year)
  if (payload === null || typeof payload !== 'object') throw new Error('响应不是 JSON 对象')
  if (Number(payload.year) !== target) throw new Error('响应年份不匹配: ' + payload.year)
  const days = Array.isArray(payload.days) ? payload.days : []
  const offDays = []
  for (const day of days) {
    if (day === null || typeof day !== 'object') continue
    if (day.isOffDay !== true) continue
    if (typeof day.date !== 'string' || !DATE_RE.test(day.date) || day.date.slice(0, 4) !== String(target)) continue
    offDays.push(day.date)
  }
  const unique = [...new Set(offDays)].sort()
  if (unique.length < MIN_OFF_DAYS) {
    throw new Error('该年节假日安排尚未发布或格式异常(days=' + days.length + ', offDays=' + unique.length + ')')
  }
  return {
    year: target,
    offDays: unique,
    papers: Array.isArray(payload.papers) ? payload.papers.filter((url) => typeof url === 'string') : [],
  }
}

/** 缓存是否该刷新：往年不可变；内置/空数据、当年与次年超 7 天都要刷新。 */
export function shouldRefresh(entry, year, nowMs, currentYear) {
  if (entry === null || !Array.isArray(entry.offDays) || entry.offDays.length === 0) return true
  if (entry.source === 'builtin') return true
  const target = Number(year)
  const current = Number(currentYear) || beijingYear(nowMs)
  if (Number.isInteger(target) && target < current) return false
  return nowMs - (Number(entry.fetchedAt) || 0) >= REFRESH_MS
}

function timeoutSignal(ms) {
  try {
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(ms)
  } catch (_) {}
  return undefined
}

async function fetchYear(year, options) {
  const fetchImpl = options && typeof options.fetchImpl === 'function' ? options.fetchImpl : fetch
  const timeoutMs = (options && (Number(options.timeoutMs) || 0)) || FETCH_TIMEOUT_MS
  const nowMs = options && Number(options.nowMs) ? Number(options.nowMs) : Date.now()
  let lastError
  for (const url of CALENDAR_SOURCES.map((make) => make(year))) {
    try {
      const response = await fetchImpl(url, {
        signal: timeoutSignal(timeoutMs),
        headers: { accept: 'application/json' },
      })
      if (response === null || typeof response !== 'object' || response.ok !== true) {
        lastError = new Error('HTTP ' + (response === null || response === undefined ? '无响应' : response.status))
        continue
      }
      const parsed = parseHolidayPayload(await response.json(), year)
      return { ...parsed, source: url, fetchedAt: nowMs, stale: false }
    } catch (error) {
      lastError = error
    }
  }
  throw lastError || new Error('没有可用的节假日数据源')
}

/**
 * 保证某年的节假日数据可用：优先内存/磁盘缓存，必要时联网拉取。
 * 永不抛出网络错误——失败时返回带 `error` 的兜底条目。
 */
export async function ensureYear(year, options = {}) {
  const target = Number(year)
  if (!Number.isInteger(target) || target < 2000 || target > 2100) throw new Error('非法年份: ' + year)
  const nowMs = Number(options.nowMs) || Date.now()
  const currentYear = beijingYear(nowMs)
  const known = getEntry(target, options)
  if (!options.force && known !== null && !shouldRefresh(known, target, nowMs, currentYear)) {
    return { ...known, stale: false }
  }
  if (!options.force && target > currentYear + MAX_YEAR_OFFSET) {
    return known || emptyEntry(target, '超出自动预取范围')
  }
  const failedAt = failures.get(target)
  if (!options.force && failedAt !== undefined && nowMs - failedAt < RETRY_MS) {
    return known || emptyEntry(target, '近期获取失败，稍后重试')
  }
  if (inflight.has(target)) return inflight.get(target)
  const task = fetchYear(target, { ...options, nowMs })
    .then((entry) => {
      failures.delete(target)
      memory.set(target, entry)
      writeDiskCache(entry, options)
      return entry
    })
    .catch((error) => {
      failures.set(target, nowMs)
      const fallback = known || builtinEntry(target) || emptyEntry(target, String(error && error.message ? error.message : error))
      return { ...fallback, stale: true, error: String(error && error.message ? error.message : error) }
    })
    .finally(() => { inflight.delete(target) })
  inflight.set(target, task)
  return task
}

/** 批量保证多年可用（自动去重）。 */
export async function ensureYears(years, options = {}) {
  const list = [...new Set((Array.isArray(years) ? years : [years])
    .map(Number)
    .filter((year) => Number.isInteger(year) && year >= 2000 && year <= 2100))]
  return Promise.all(list.map((year) => ensureYear(year, options)))
}

/** 某天是否中国法定节假日（未知年份按「不是」处理，等价于旧的仅工作日口径）。 */
export function isOffDay(dateKey) {
  if (typeof dateKey !== 'string' || !DATE_RE.test(dateKey)) return false
  const year = Number(dateKey.slice(0, 4))
  const entry = getEntry(year)
  return entry !== null && entry.offDays.indexOf(dateKey) !== -1
}

/** 当前缓存/数据源概况（排障用，/enh/ping 可带出）。 */
export function calendarSnapshot() {
  const years = {}
  for (const [year, entry] of memory) {
    years[year] = {
      source: entry.source,
      fetchedAt: entry.fetchedAt,
      offDays: entry.offDays.length,
      stale: entry.stale === true,
    }
  }
  return { years, sources: CALENDAR_SOURCES.map((make) => make(2026).replace('2026', '<year>')) }
}

export const __test = {
  /** 直接注入某年数据（测试用，不落盘）。 */
  setEntry(year, offDays, extra) {
    memory.set(Number(year), {
      year: Number(year),
      offDays: offDays.slice().sort(),
      source: 'test',
      fetchedAt: Date.now(),
      stale: false,
      ...(extra || {}),
    })
  },
  deleteEntry(year) {
    memory.delete(Number(year))
  },
  clearMemory() {
    memory.clear()
  },
  clearFailures() {
    failures.clear()
  },
  clearAll() {
    memory.clear()
    failures.clear()
    inflight.clear()
  },
  failures,
  memory,
  getEntry,
  cacheFile: cacheFileOf,
}
