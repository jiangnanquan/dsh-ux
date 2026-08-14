// DSH 沉浸式桌面壳 —— 无边框窗口加载 dsh web 前端 (127.0.0.1:3080)
// 用法: electron main.js  (DSH_URL 可覆盖目标地址)
const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron')
const net = require('node:net')

const TARGET = process.env.DSH_URL || 'http://127.0.0.1:3080'

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

// ---- 页面悬浮层：顶部拖带 + 右上角控制钮（平时透明，悬停显现）----
const OVERLAY_JS = `(() => {
  if (window.__dshShell) return
  window.__dshShell = true
  const style = document.createElement('style')
  style.textContent = \`
    #dsh-shell-drag { position: fixed; top: 0; left: 0; right: 0; height: 12px; z-index: 2147483646; -webkit-app-region: drag; transition: background .15s; }
    #dsh-shell-drag:hover { background: rgba(127,127,127,.08); }
    #dsh-shell-controls { position: fixed; top: 8px; right: 8px; z-index: 2147483647; display: flex; gap: 6px; opacity: 0; transition: opacity .18s; -webkit-app-region: no-drag; }
    #dsh-shell-controls:hover { opacity: 1; }
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
  document.body.appendChild(drag)
  document.body.appendChild(ctl)
})()`

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 620,
    frame: false,                 // 无边框沉浸
    show: false,
    backgroundColor: '#0d1117',
    webPreferences: {
      preload: require('node:path').join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  })

  win.loadURL(TARGET)
  win.once('ready-to-show', () => win.show())
  win.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript(OVERLAY_JS, true)
    // 调试快照：DSH_SNAPSHOT=/tmp/x.png 时保存窗口截图后退出
    if (process.env.DSH_SNAPSHOT) {
      setTimeout(() => {
        win.webContents.capturePage().then((img) => {
          require('node:fs').writeFileSync(process.env.DSH_SNAPSHOT, img.toPNG())
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
  // 快捷键：Cmd+Q 退出 / Cmd+Shift+F 或 F11 全屏
  globalShortcut.register('CommandOrControl+Shift+F', () => {
    for (const w of BrowserWindow.getAllWindows()) w.setFullScreen(!w.isFullScreen())
  })
  globalShortcut.register('F11', () => {
    for (const w of BrowserWindow.getAllWindows()) w.setFullScreen(!w.isFullScreen())
  })

  const ok = await waitForServer()
  if (!ok) {
    console.error(`[dsh-shell] ${TARGET} 一直未就绪，退出`)
    app.exit(1)
    return
  }
  createWindow()
  console.log(`[dsh-shell] 已连接 ${TARGET}`)
})

app.on('will-quit', () => globalShortcut.unregisterAll())
app.on('window-all-closed', () => app.quit())
