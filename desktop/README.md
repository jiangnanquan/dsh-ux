# dsh-desktop

dsh(DeepSeek Harness)的无边框沉浸式桌面壳:把 dsh web 前端装进一个无边框 Electron 窗口,自带悬浮窗口控制。

## 特性

- **无边框窗口**(`frame: false`),顶部 12px 拖拽带,右上角悬停显现全屏 / 最小化 / 关闭按钮
- **双击即用**:`启动 DSH.command` 自动检测后端 → 未运行则拉起 `dsh web` → 等就绪 → 开窗 → 退出时只清理自己拉起的后端(你自己开的 dsh 不受影响)
- 快捷键:`Cmd+Q` 退出、`Cmd+Shift+F` / `F11` 切换全屏
- 安全配置:`contextIsolation` 开启、`nodeIntegration` 关闭,窗口控制经 preload `contextBridge` 暴露

## 平台要求

- **macOS**(启动脚本为 zsh `.command`;窗口逻辑本身跨平台,其他系统可直接 `electron main.js`)
- Node.js + 本机已能运行 `dsh web`(即已配置 DSH profile)

## 使用

### 方式一:双击启动(推荐)

```bash
npm install        # 首次使用,安装 Electron
open "启动 DSH.command"
```

脚本内部:检测 `127.0.0.1:3080` 是否已有 dsh → 无则后台拉起 `npx --yes @deepseek-ai/dsh web --port 3080` → 等端口就绪 → 启动 Electron 壳 → 壳退出后清理本次拉起的 dsh。

### 方式二:手动启动

```bash
npm install
npm start          # 等价于 electron main.js,默认连 http://127.0.0.1:3080
```

## 环境变量

| 变量 | 作用 |
|------|------|
| `DSH_URL` | 覆盖窗口加载的目标地址,默认 `http://127.0.0.1:3080` |
| `DSH_SNAPSHOT` | 截图调试模式:窗口加载 4 秒后把页面截图写到该路径并退出,例如 `DSH_SNAPSHOT=/tmp/x.png npm start` |

## License

MIT
