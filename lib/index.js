/**
 * dsh-enhance host half (固化版).
 * 提供四个 JSON 路由给浏览器端 fetch:
 *   GET /enh/ping           宿主半构建号(设置页据此提示「是否需要重启」)
 *   GET /enh/balance        官方账户余额
 *   GET /enh/session-usage  本会话完整日志用量+成本
 *   GET /enh/usage          近 30 天按天用量+成本(最近 60 个会话)
 * 计价:按每次请求的模型与时间自动套官方峰谷价(8/17 起北京时间 9-12、14-18 高峰,空闲半价;此前为现行价)。
 */
import { readFileSync } from 'node:fs'

/** 宿主半构建号 = package.json 的 version。客户端半的 CLIENT_BUILD 必须与之相同。 */
const PKG = (() => {
  try {
    return JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  } catch (_) {
    return {}
  }
})()
const BUILD = typeof PKG.version === 'string' ? PKG.version : 'unknown'

const NEW_PRICING_EPOCH = Date.UTC(2026, 7, 17, 0, 0) - 8 * 3600 * 1000

function beijingParts(timeMs) {
  const bj = new Date(timeMs + 8 * 3600 * 1000)
  return { hour: bj.getUTCHours(), minute: bj.getUTCMinutes() }
}

function pricingFor(model, timeMs) {
  const isFlash = typeof model === 'string' ? model.indexOf('flash') !== -1 : true
  if (timeMs < NEW_PRICING_EPOCH) {
    return isFlash
      ? { hit: 0.02, miss: 1.0, out: 2.0 }
      : { hit: 0.025, miss: 3.0, out: 6.0 }
  }
  const p = beijingParts(timeMs)
  const peak = (p.hour >= 9 && p.hour < 12) || (p.hour >= 14 && p.hour < 18)
  if (isFlash) {
    return peak ? { hit: 0.1, miss: 3.0, out: 9.0 } : { hit: 0.05, miss: 1.5, out: 4.5 }
  }
  return peak ? { hit: 0.3, miss: 9.0, out: 27.0 } : { hit: 0.15, miss: 4.5, out: 13.5 }
}

function foldEvents(events) {
  const fold = { input: 0, cacheRead: 0, output: 0, cost: 0, requests: 0, steps: [], provider: undefined, model: undefined }
  let currentModel
  let currentProvider
  for (let i = 0; i < events.length; i++) {
    const ev = events[i]
    if (ev.type === 'request/header') {
      const h = ev.data && ev.data.header
      if (h) {
        if (typeof h.model === 'string') currentModel = h.model
        const config = h.config
        if (config !== null && typeof config === 'object' && typeof config.provider === 'string') currentProvider = config.provider
      }
      continue
    }
    if (ev.type !== 'assistant/message') continue
    const usage = ev.data && ev.data.usage
    if (usage === undefined) continue
    const uInput = Number(usage.inputTokens) || 0
    const uCache = Number(usage.cacheReadTokens) || 0
    const uOutput = Number(usage.outputTokens) || 0
    const uncached = Math.max(0, uInput - uCache)
    const pr = pricingFor(currentModel, ev.time)
    const cost = (uncached * pr.miss + uCache * pr.hit + uOutput * pr.out) / 1000000
    fold.requests += 1
    fold.input += uncached
    fold.cacheRead += uCache
    fold.output += uOutput
    fold.cost += cost
    fold.steps.push({ idx: fold.requests, input: uncached, cacheRead: uCache, output: uOutput, cost, time: ev.time })
  }
  // 最近一次请求真正使用的 provider / model：峰谷提示只对官方 API / 官方账号的计费生效，
  // 不能拿「余额能查」当判据（余额走 API Key，用户完全可能在用第三方 provider）。
  fold.provider = currentProvider
  fold.model = currentModel
  return fold
}

function sendJson(res, body) {
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(body))
}

function errorMessage(error) {
  return String(error !== null && typeof error === 'object' && 'message' in error ? error.message : error)
}

/**
 * 首帧开关标记脚本。dsh-ux 的每个功能都是一层叠加（不动官方设置本身：官方 settings 的
 * ui-theme 段只接受 light/dark/system，第三方主题存不进去且会被 adopt 覆盖），开关状态
 * 记在一枚 cookie 里。这行脚本由 host 注入到 body 起始处，在任何渲染前把开关落到 html
 * 属性上，CSS 闸门据此生效 —— 否则会先按官方配色画一帧再跳成 Solarized。
 * 属性名与客户端半的 applyStateToDom 完全一致（data-dsh-ux 总开关 + data-dsh-ux-<键>），
 * 客户端改动开关时写同一批属性，所以两边不会分叉。
 * 布尔键写 on/off；theme / font / fontweight / ink 是枚举，写白名单里的值（越界一律回落默认），
 * 这样「配色主题」「字体方案」「文字墨色」也是首帧前定好的，不会先用官方配色/字体画一帧再换。
 * 主题另带一个派生属性 data-dsh-ux-theme-tone（light/dark/auto），墨色层据此决定是否生效。
 * 旧版 cookie 里 theme / font 是布尔，true/false 映射回各自的默认值/off。
 * cookie 缺失按默认处理（布尔全开、Solarized 主题、字体 auto、字重半粗、墨色深墨）：
 * 默认值与设置页的「推荐」徽标一致；深色主题自带 ink，不受墨色层影响。
 * 旧版只记一枚 dsh-enhance-theme（且没有总开关），这里保留回退分支，老 cookie 不会被忽略。
 */
const FEATURE_KEYS = ['layout', 'fold', 'usage']
const THEME_KEYS = [
  'off',
  // 第一部 · 经典 CRT
  'green-phosphor', 'amber-phosphor', 'matrix-rain', 'cyberpunk-2077', 'radar-red', 'weyland-corp', 'nerv-magi',
  // 第二部 · 纸面浅色
  'p4-white', 'everforest-light', 'parchment-classic', 'solarized-light', 'catppuccin-latte',
  // 第三部 · 现代
  'tokyo-night', 'tokyo-night-day', 'kanagawa-wave', 'kanagawa-lotus', 'rose-pine', 'rose-pine-dawn', 'catppuccin-mocha',
  // 第三部 · AI 品牌
  'claude-light', 'claude-dark', 'openai-light', 'openai-dark', 'gemini-light', 'gemini-dark',
]
const THEME_TONES = {
  off: 'auto',
  'green-phosphor': 'dark', 'amber-phosphor': 'dark', 'matrix-rain': 'dark', 'cyberpunk-2077': 'dark',
  'radar-red': 'dark', 'weyland-corp': 'dark', 'nerv-magi': 'dark',
  'p4-white': 'light', 'everforest-light': 'light', 'parchment-classic': 'light', 'solarized-light': 'light', 'catppuccin-latte': 'light',
  'tokyo-night': 'dark', 'tokyo-night-day': 'light', 'kanagawa-wave': 'dark', 'kanagawa-lotus': 'light',
  'rose-pine': 'dark', 'rose-pine-dawn': 'light', 'catppuccin-mocha': 'dark',
  'claude-light': 'light', 'claude-dark': 'dark', 'openai-light': 'light', 'openai-dark': 'dark',
  'gemini-light': 'light', 'gemini-dark': 'dark',
}
const ENUM_KEYS = {
  theme: THEME_KEYS,
  font: ['off', 'auto', 'sans-mono', 'sans-term', 'noto', 'maple'],
  fontweight: ['regular', 'semibold'],
  ink: ['theme', 'deep', 'black'],
}
const ENUM_DEFAULTS = { theme: 'solarized-light', font: 'auto', fontweight: 'semibold', ink: 'deep' }

function configMarkInjection() {
  return {
    kind: 'script',
    placement: 'body',
    text: `(()=>{try{
var KEYS=${JSON.stringify(FEATURE_KEYS)};
var ENUMS=${JSON.stringify(ENUM_KEYS)};
var ENUM_DEF=${JSON.stringify(ENUM_DEFAULTS)};
var TONES=${JSON.stringify(THEME_TONES)};
var s={master:true};
for(var i=0;i<KEYS.length;i++)s[KEYS[i]]=true;
for(var e in ENUM_DEF)s[e]=ENUM_DEF[e];
var m=/(?:^|; )dsh-enhance-config=([^;]*)/.exec(document.cookie);
if(m){try{var p=JSON.parse(decodeURIComponent(m[1]));
if(p&&typeof p==='object'){
if(typeof p.master==='boolean')s.master=p.master;
for(var j=0;j<KEYS.length;j++)if(typeof p[KEYS[j]]==='boolean')s[KEYS[j]]=p[KEYS[j]];
for(var e2 in ENUMS){
var v=p[e2];
if(v===true)v=ENUM_DEF[e2];else if(v===false)v='off';
if(ENUMS[e2].indexOf(v)!==-1)s[e2]=v;}}}catch(_){}}
else{var t=/(?:^|; )dsh-enhance-theme=([^;]*)/.exec(document.cookie);if(t&&t[1]==='off')s.theme='off'}
var d=document.documentElement;
d.setAttribute('data-dsh-ux',s.master?'on':'off');
for(var k=0;k<KEYS.length;k++)d.setAttribute('data-dsh-ux-'+KEYS[k],(s.master&&s[KEYS[k]])?'on':'off');
for(var e3 in ENUMS){
var w=s[e3];
if(!s.master&&(e3==='font'||e3==='theme'))w='off';
d.setAttribute('data-dsh-ux-'+e3,w);}
d.setAttribute('data-dsh-ux-theme-tone',TONES[s.master?s.theme:'off']||'auto');
}catch(_){}})()`,
  }
}

/**
 * 对话接口的 baseURL 不是余额接口的根:0.2.0 起 llm-deepseek 默认指向
 * https://api.deepseek.com/anthropic(Messages 兼容),而余额在 OpenAI 兼容根上的
 * /user/balance。剥掉已知的接口后缀,把对话端点还原成接口根。
 */
const DEFAULT_API_ROOT = 'https://api.deepseek.com'
const API_PATH_SUFFIXES = ['/anthropic/v1', '/anthropic', '/v1']

function apiRootOf(base) {
  if (typeof base !== 'string') return undefined
  const trimmed = base.trim()
  if (trimmed === '') return undefined
  let root = trimmed.replace(/\/+$/, '')
  for (const suffix of API_PATH_SUFFIXES) {
    if (root.length > suffix.length && root.endsWith(suffix)) {
      root = root.slice(0, -suffix.length)
      break
    }
  }
  return root === '' ? undefined : root
}

/**
 * 读 llm-deepseek 当前生效的 baseURL。两代 settings 服务形状不同:
 * - 0.1.x:`settings.get(section)` 直接返回配置段;
 * - 0.2.0:settings 换成 volatile 表单投影(只有 describe/update/replace…),
 *   只能 describe() 后按 entry id 取 `value`;baseURL 恰好声明为 volatile,仍在投影里。
 * 两代都取不到就返回 undefined,由调用方回落到默认根。
 */
function settingsBaseURL(ctx) {
  let settings
  try {
    settings = ctx.get('settings')
  } catch (_) {
    return undefined
  }
  if (settings === undefined || settings === null) return undefined
  if (typeof settings.get === 'function') {
    try {
      const section = settings.get('llm-deepseek')
      if (section !== null && typeof section === 'object' && typeof section.baseURL === 'string') return section.baseURL
    } catch (_) {}
  }
  if (typeof settings.describe === 'function') {
    try {
      const forms = settings.describe()
      if (Array.isArray(forms)) {
        for (const form of forms) {
          if (form === null || typeof form !== 'object' || form.ns !== 'llm-deepseek') continue
          const value = form.value
          if (value !== null && typeof value === 'object' && typeof value.baseURL === 'string') return value.baseURL
        }
      }
    } catch (_) {}
  }
  return undefined
}

async function resolveBaseURL(ctx) {
  return apiRootOf(settingsBaseURL(ctx)) ?? DEFAULT_API_ROOT
}

export const name = 'dsh-enhance'

export function apply(ctx) {
  let registered = false
  const registerRoutes = (value) => {
    if (registered) return
    const webServer = value ?? ctx.reflect.get('webServer', false)
    if (webServer === undefined) return
    registered = true

  webServer.register({
    kind: 'exact',
    path: '/enh/ping',
    handler: async (req, res) => {
      sendJson(res, { ok: true, build: BUILD, version: BUILD, routes: ['/enh/balance', '/enh/session-usage', '/enh/usage'] })
    },
  })

  webServer.register({
    kind: 'exact',
    path: '/enh/balance',
    handler: async (req, res) => {
      try {
        const credentials = ctx.get('credentials')
        const resolved = credentials === undefined ? undefined : await credentials.resolve('DEEPSEEK_API_KEY')
        if (!resolved) return sendJson(res, { error: '未配置 DEEPSEEK_API_KEY 凭据' })
        const base = await resolveBaseURL(ctx)
        const response = await fetch(base.replace(/\/$/, '') + '/user/balance', {
          headers: { authorization: 'Bearer ' + resolved.value },
          signal: AbortSignal.timeout(15000),
        })
        if (!response.ok) return sendJson(res, { error: '请求失败: HTTP ' + response.status })
        const payload = await response.json()
        const infos = Array.isArray(payload.balance_infos) ? payload.balance_infos : []
        if (infos.length === 0) return sendJson(res, { error: '响应缺少余额数据' })
        const info = infos[0]
        sendJson(res, {
          currency: typeof info.currency === 'string' ? info.currency : 'CNY',
          total: info.total_balance,
          granted: info.granted_balance,
          toppedUp: info.topped_up_balance,
          available: payload.is_available !== false,
          fetchedAt: Date.now(),
        })
      } catch (error) {
        sendJson(res, { error: errorMessage(error) })
      }
    },
  })

  webServer.register({
    kind: 'exact',
    path: '/enh/session-usage',
    handler: async (req, res) => {
      try {
        const sessionId = new URL(req.url, 'http://dsh.local').searchParams.get('sessionId')
        if (typeof sessionId !== 'string' || sessionId === '') return sendJson(res, { error: '缺少 sessionId' })
        const q = ctx.get('sessionQuery')
        if (q === undefined) return sendJson(res, { error: 'sessionQuery 不可用' })
        const snap = await q.readSession(sessionId)
        sendJson(res, foldEvents(snap.events))
      } catch (error) {
        sendJson(res, { error: errorMessage(error) })
      }
    },
  })

  webServer.register({
    kind: 'exact',
    path: '/enh/usage',
    handler: async (req, res) => {
      try {
        const q = ctx.get('sessionQuery')
        if (q === undefined) return sendJson(res, { error: 'sessionQuery 不可用' })
        const sessions = await q.listSessions()
        const byDay = new Map()
        let scanned = 0
        let requests = 0
        for (const s of sessions) {
          if (scanned >= 60) break
          scanned++
          if (!s || !s.header || !s.header.id) continue
          try {
            const snap = await q.readSession(s.header.id)
            const fold = foldEvents(snap.events)
            for (const step of fold.steps) {
              const d = new Date(step.time)
              const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
              let cell = byDay.get(key)
              if (!cell) {
                cell = { input: 0, output: 0, cacheRead: 0, cost: 0, requests: 0 }
                byDay.set(key, cell)
              }
              cell.input += step.input
              cell.output += step.output
              cell.cacheRead += step.cacheRead
              cell.cost += step.cost
              cell.requests += 1
              requests += 1
            }
          } catch (_) {}
        }
        const days = []
        const now = new Date()
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
          const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
          const cell = byDay.get(key) || { input: 0, output: 0, cacheRead: 0, cost: 0, requests: 0 }
          days.push({ date: String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'), input: cell.input, output: cell.output, cacheRead: cell.cacheRead, cost: cell.cost, requests: cell.requests })
        }
        const total = { input: 0, output: 0, cacheRead: 0, cost: 0 }
        for (const c of byDay.values()) {
          total.input += c.input
          total.output += c.output
          total.cacheRead += c.cacheRead
          total.cost += c.cost
        }
        sendJson(res, { days, total, totalCost: total.cost, requests, sessionsScanned: scanned })
      } catch (error) {
        sendJson(res, { error: errorMessage(error) })
      }
    },
  })
  }

  registerRoutes(undefined)
  ctx.on('internal/service', (name, value) => {
    if (name === 'webServer') registerRoutes(value)
  })
  ctx.on('webserver/index-inject', (table) => {
    table.push(configMarkInjection())
  })
}
