// DSH 沉浸式桌面壳 —— 无边框窗口加载 dsh web 前端 (默认 127.0.0.1:3080)
// 用法: electron main.js   (DSH_URL 覆盖目标地址)
//
// 0.1.5 起 dsh web 的浏览器入口需要认证：启动时打印的
//   dsh web: http://127.0.0.1:3080/?token=xxxx
// 是官方入口（303 → Set-Cookie dsh-auth-*，一枚绑定 authority 的签名 cookie）。
// 本壳两条路都要走通：
//   冷启动 —— 启动脚本把自己拉起的后端打印的入口 URL 经 DSH_AUTH_URL 传进来，直接走官方入口；
//   复用已有后端 —— 拿不到进程内 token，用 $DSH_HOME/.credentials.yaml 里的持久签名密钥
//   自签一枚等价 cookie 再进干净地址（复用场景下唯一不依赖进程内存的入口）。
const { app, BrowserWindow, ipcMain, session } = require('electron')
const net = require('node:net')
const path = require('node:path')
const fs = require('node:fs')
const os = require('node:os')
const crypto = require('node:crypto')

const TARGET = process.env.DSH_URL || 'http://127.0.0.1:3080'
const LAUNCH_URL = process.env.DSH_AUTH_URL || ''
const SNAPSHOT = process.env.DSH_SNAPSHOT || ''

// 与官方 client-connection 的 browser-session 约定保持一致（0.1.5 / 0.1.6-alpha 相同）。
const COOKIE_PREFIX = 'dsh-auth-'
const COOKIE_PAYLOAD_VERSION = 1
const COOKIE_MAX_AGE_DAYS = 30
const SECRET_BYTES = 32

// ---- 等待 dsh 后端就绪（脚本先起 dsh，壳负责兜底等待）----
function waitForServer(tries = 100, intervalMs = 500) {
  const u = new URL(TARGET)
  return new Promise((resolve) => {
    const attempt = (left) => {
      const s = net.connect(Number(u.port), u.hostname)
      const done = (ok) => {
        s.destroy()
        if (ok) return resolve(true)
        if (left <= 0) return resolve(false)
        setTimeout(() => attempt(left - 1), intervalMs)
      }
      s.once('connect', () => done(true))
      s.once('error', () => done(false))
    }
    attempt(tries)
  })
}

// ---- 浏览器会话认证（0.1.5+）----
function base64url(buffer) {
  return buffer.toString('base64').replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '')
}

/**
 * 读取本机 DSH 凭证里 client-connection 的 browser-session 签名密钥。
 * 该记录由 dsh web 首次启动时写入（kind: grant / payload.secret，32 字节 base64url）。
 * @returns {Buffer|undefined} 32 字节密钥；文件缺失或格式不认识时返回 undefined。
 */
function readBrowserSessionSecret() {
  const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  let text
  try {
    text = fs.readFileSync(path.join(home, '.credentials.yaml'), 'utf8')
  } catch {
    return undefined
  }
  const at = text.indexOf('client-connection/browser-session')
  if (at === -1) return undefined
  const matched = /secret:\s*["']?([A-Za-z0-9_-]{43})["']?/.exec(text.slice(at, at + 400))
  if (matched === null) return undefined
  const secret = Buffer.from(matched[1].replaceAll('-', '+').replaceAll('_', '/'), 'base64')
  return secret.byteLength === SECRET_BYTES ? secret : undefined
}

/**
 * 补一枚官方等价格式的浏览器会话 cookie：name/载荷/签名与 client-connection 的
 * BrowserAuth 完全一致（v1 载荷 + HMAC-SHA256，authority 绑定）。
 * 复用别人拉起的后端时拿不到 token，只能这样进页面。
 * @returns {Promise<boolean>} 是否成功写入 cookie。
 */
async function ensureBrowserSession() {
  const secret = readBrowserSessionSecret()
  if (secret === undefined) return false
  const authority = new URL(TARGET).host
  const issuedAt = Date.now()
  const expiresAt = issuedAt + COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000
  const body = base64url(Buffer.from(JSON.stringify({
    version: COOKIE_PAYLOAD_VERSION,
    authority,
    issuedAt,
    expiresAt,
  }), 'utf8'))
  const name = COOKIE_PREFIX + base64url(crypto.createHash('sha256').update(authority).digest())
  const value = `v1.${body}.${base64url(crypto.createHmac('sha256', secret).update(body).digest())}`
  await session.defaultSession.cookies.set({
    url: TARGET,
    name,
    value,
    httpOnly: true,
    sameSite: 'strict',
    expirationDate: expiresAt / 1000,
  })
  return true
}

/** 认证失败时的兜底页：解释原因 + 给出恢复动作，替代 401 的纯文本。 */
function showAuthHint(win) {
  if (win.__dshAuthHint === true) return
  win.__dshAuthHint = true
  const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8">
<title>DSH 桌面壳 — 需要重新认证</title>
<style>
  body { margin: 0; height: 100vh; display: flex; align-items: center; justify-content: center;
         background: #fdf6e3; color: #073642; font: 14px/1.8 -apple-system, "PingFang SC", sans-serif; }
  main { max-width: 560px; padding: 32px; }
  h1 { font-size: 18px; margin: 0 0 12px; }
  code { background: #eee8d5; border-radius: 4px; padding: 1px 6px; }
  pre { background: #eee8d5; border-radius: 6px; padding: 12px 14px; overflow: auto; }
  p { margin: 10px 0; }
</style>
<main>
  <h1>无法进入 DSH：浏览器会话认证未通过</h1>
  <p>后端 <code>${TARGET}</code> 要求一枚 <code>dsh-auth-*</code> 会话 cookie，本窗口没有拿到。</p>
  <p>通常是后端版本变了、认证约定变了，或 <code>~/.dsh/.credentials.yaml</code> 里没有
     <code>client-connection/browser-session</code> 记录（全新 DSH_HOME 时由 dsh web 首次启动写入）。</p>
  <p>按下面任一步恢复：</p>
  <pre># 1) 退出本窗口，双击「启动 DSH.command」（会带上官方 token 入口）
# 2) 或在终端里手动打开 dsh web 打印的那条带 token 的 URL：
dsh web</pre>
  <p>按 <code>Cmd+R</code> 可重试。</p>
</main></html>`
  win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
}

// ---- 页面悬浮层：顶部拖带 + 右上角控制钮（平时透明，指针靠近才显现）----
const OVERLAY_JS = `(() => {
  if (window.__dshShell) return
  window.__dshShell = true
  const style = document.createElement('style')
  style.textContent = \`
    #dsh-shell-drag { position: fixed; top: 0; left: 0; right: 0; height: 12px; z-index: 2147483646; -webkit-app-region: drag; transition: background .15s; }
    #dsh-shell-drag:hover { background: rgba(127,127,127,.08); }
    /* 收起时必须 pointer-events:none：三个隐形按钮会吃掉右上角底下内容的点击
       （消息区正好滚到那里，包括代码块复制按钮）。 */
    #dsh-shell-controls { position: fixed; top: 8px; right: 8px; z-index: 2147483647; display: flex; gap: 6px; opacity: 0; pointer-events: none; transition: opacity .18s; -webkit-app-region: no-drag; }
    #dsh-shell-controls.dsh-shell-revealed { opacity: 1; pointer-events: auto; }
    #dsh-shell-controls button { width: 28px; height: 28px; border-radius: 50%; border: none; cursor: pointer; font-size: 13px; line-height: 28px; text-align: center; color: #d7dde5; background: rgba(35,40,50,.72); backdrop-filter: blur(6px); box-shadow: 0 1px 4px rgba(0,0,0,.35); }
    #dsh-shell-controls button:hover { background: rgba(35,40,50,.95); }
    #dsh-shell-controls .dsh-shell-close:hover { background: #e81123; }
  \`
  document.head.appendChild(style)
  const drag = document.createElement('div'); drag.id = 'dsh-shell-drag'
  const ctl = document.createElement('div'); ctl.id = 'dsh-shell-controls'
  const mk = (label, cls, fn) => { const b = document.createElement('button'); b.className = cls; b.textContent = label; b.addEventListener('click', fn); return b }
  const api = window.electronAPI || {}
  ctl.appendChild(mk('⤢', 'dsh-shell-full', () => api.toggleFullscreen && api.toggleFullscreen()))
  ctl.appendChild(mk('—', 'dsh-shell-min', () => api.minimize && api.minimize()))
  ctl.appendChild(mk('✕', 'dsh-shell-close', () => api.close && api.close()))
  // 不用 :hover 显现：那要求控件始终可命中，于是收起状态也在挡点击。
  // 改成指针靠近右上角就显形，控件本身不占命中区域。
  const REVEAL_WIDTH = 200
  const REVEAL_HEIGHT = 56
  const reveal = (event) => {
    const near = event.clientX >= window.innerWidth - REVEAL_WIDTH && event.clientY <= REVEAL_HEIGHT
    ctl.classList.toggle('dsh-shell-revealed', near)
  }
  const hide = () => ctl.classList.remove('dsh-shell-revealed')
  window.addEventListener('mousemove', reveal, { passive: true })
  window.addEventListener('mouseout', (event) => { if (event.relatedTarget === null) hide() }, { passive: true })
  window.addEventListener('blur', hide)
  ctl.addEventListener('focusin', () => ctl.classList.add('dsh-shell-revealed'))
  document.body.appendChild(drag)
  document.body.appendChild(ctl)
})()`

// ---- 窗口内快捷键（before-input-event：只在本窗口生效，不抢占其他 App 的按键）----
function bindShortcuts(win) {
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return
    const key = String(input.key || '').toLowerCase()
    const toggleFullScreen = () => {
      event.preventDefault()
      win.setFullScreen(!win.isFullScreen())
    }
    if (key === 'f11') return toggleFullScreen()
    if (key === 'f' && input.shift && (input.meta || input.control)) return toggleFullScreen()
    if (key === 'f' && input.meta && input.control) return toggleFullScreen() // macOS 原生全屏键
    if (key === 'r' && input.meta) {
      event.preventDefault()
      win.__dshAuthHint = false
      win.webContents.reload()
    }
  })
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 620,
    frame: false,                 // 无边框沉浸
    show: false,
    backgroundColor: '#0d1117',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  })

  bindShortcuts(win)

  // 入口选择：官方 token 入口优先；复用场景先补会话 cookie 再进干净地址。
  let entry = TARGET
  if (LAUNCH_URL !== '') {
    entry = LAUNCH_URL
    console.log('[dsh-shell] 走官方 token 入口')
  } else {
    let prepared = false
    try {
      prepared = await ensureBrowserSession()
    } catch (error) {
      console.error('[dsh-shell] 浏览器会话 cookie 写入失败', error)
    }
    console.log(prepared
      ? '[dsh-shell] 已用本机凭证补浏览器会话 cookie'
      : '[dsh-shell] 未找到可用凭证，直接访问（若后端要求认证会提示）')
  }

  win.loadURL(entry)
  win.once('ready-to-show', () => win.show())
  win.webContents.on('did-navigate', (_event, url, httpCode) => {
    if (typeof httpCode === 'number' && httpCode >= 400) console.log(`[dsh-shell] ${url} → HTTP ${httpCode}`)
    if (httpCode === 401) showAuthHint(win)
  })
  win.webContents.on('did-finish-load', () => {
    if (win.__dshAuthHint !== true) win.webContents.executeJavaScript(OVERLAY_JS, true)
    // 调试快照：DSH_SNAPSHOT=/tmp/x.png 时保存窗口截图后退出。
    // 认证失败页也要能截到：早期实现在这里直接 return，导致需要看认证提示时
    // 调试模式反而不退出也不出图，排查现场时只能干等。
    if (SNAPSHOT !== '') {
      setTimeout(() => {
        win.webContents.capturePage().then((img) => {
          fs.writeFileSync(SNAPSHOT, img.toPNG())
          app.quit()
        })
      }, 4000)
    }
  })
  return win
}

// ---- 窗口控制 IPC ----
function winOf(event) { return BrowserWindow.fromWebContents(event.sender) }
ipcMain.on('shell:fullscreen', (e) => { const w = winOf(e); if (w) w.setFullScreen(!w.isFullScreen()) })
ipcMain.on('shell:minimize', (e) => { const w = winOf(e); if (w) w.minimize() })
ipcMain.on('shell:close', (e) => { const w = winOf(e); if (w) w.close() })

app.whenReady().then(async () => {
  const ok = await waitForServer()
  if (!ok) {
    console.error(`[dsh-shell] ${TARGET} 一直未就绪，退出`)
    app.exit(1)
    return
  }
  await createWindow()
  console.log(`[dsh-shell] 已连接 ${TARGET}`)
})

app.on('window-all-closed', () => app.quit())
