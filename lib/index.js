/**
 * dsh-enhance host half (固化版).
 * 提供三个 JSON 路由给浏览器端 fetch:
 *   GET /enh/balance        官方账户余额
 *   GET /enh/session-usage  本会话完整日志用量+成本
 *   GET /enh/usage          近 30 天按天用量+成本(最近 60 个会话)
 * 计价:按每次请求的模型与时间自动套官方峰谷价(8/17 起北京时间 9-12、14-18 高峰,空闲半价;此前为现行价)。
 */
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
  const fold = { input: 0, cacheRead: 0, output: 0, cost: 0, requests: 0, steps: [] }
  let currentModel
  for (let i = 0; i < events.length; i++) {
    const ev = events[i]
    if (ev.type === 'request/header') {
      const h = ev.data && ev.data.header
      if (h && typeof h.model === 'string') currentModel = h.model
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
  return fold
}

function sendJson(res, body) {
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(body))
}

function errorMessage(error) {
  return String(error !== null && typeof error === 'object' && 'message' in error ? error.message : error)
}

async function resolveBaseURL(ctx) {
  let base = 'https://api.deepseek.com'
  try {
    const settings = ctx.get('settings')
    if (settings !== undefined) {
      const section = settings.get('llm-deepseek')
      if (section !== null && typeof section === 'object' && typeof section.baseURL === 'string' && section.baseURL !== '') {
        base = section.baseURL
      }
    }
  } catch (_) {}
  return base
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
}
