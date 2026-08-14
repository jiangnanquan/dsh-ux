// DSH 沉浸式壳 preload：把窗口控制桥接给页面悬浮按钮
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  toggleFullscreen: () => ipcRenderer.send('shell:fullscreen'),
  minimize: () => ipcRenderer.send('shell:minimize'),
  close: () => ipcRenderer.send('shell:close'),
})
