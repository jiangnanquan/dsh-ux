# dsh-ux

DSH(DeepSeek Harness)Web 界面体验套件,包含两件东西:

| 部分 | 内容 |
|------|------|
| **dsh-enhance**(仓库根目录) | DSH web 插件:主题、布局、折叠胶囊、账户用量 |
| **dsh-desktop**(`desktop/` 子目录) | 无边框 Electron 桌面壳,双击即用 |

![dsh-enhance](screenshot.png)

## 能力(dsh-enhance)

| 类别 | 内容 |
|------|------|
| 主题 | Solarized 浅色配色(深色保留官方默认)+ Maple Mono 字体栈(检测到才启用) |
| 布局 | 加宽消息列、紧凑间距、收窄输入队列、禁用橡皮筋滚动 |
| 折叠胶囊 | 思考块聚合为 `Think ×N` 胶囊、工具调用聚合为 `A → B → C` 链路胶囊；长链路按可用宽度换行，每行独立成胶囊，点击任一行展开 |
| 账户用量 | 底部显示官方账户余额、本轮 token 成本、近 30 天用量图表 |

## 安装

前置:已按 DSH 的 profile 机制运行(`dsh web`)。

```bash
dsh plugin --profile web add github:jiangnanquan/dsh-ux#main
```

本包声明了 `dsh.bundle.patch` 与 `dsh.client`,`dsh plugin add` 会自动把它加入 profile 的 bundles,**重启 dsh 后即生效**,无需手改任何配置。重复执行该命令是安全的(幂等);升级用 `dsh plugin --profile web update dsh-enhance`。

## 交给你的 AI

不想手动敲命令?把下面这段话粘贴给任意 AI agent(Claude Code、dsh、Gemini CLI……),让它读 INSTALL.md 并完成安装与自检:

> 请按照 https://github.com/jiangnanquan/dsh-ux/blob/main/INSTALL.md 里的步骤,在我的机器上安装并验证 dsh-enhance 插件(profile 用 web),然后运行文档里的健康检查并告诉我结果。如果任何一步失败,按文档的回滚步骤恢复原状并说明原因。

## 桌面壳(dsh-desktop)

macOS 无边框沉浸式窗口,把 dsh web 装进桌面应用形态:双击 `启动 DSH.command` 自动拉起后端 + 窗口,退出时只清理自己拉起的后端。支持 `DSH_URL` / `DSH_SNAPSHOT` 环境变量。

见 [desktop/README.md](desktop/README.md)。

## 依赖与前提(dsh-enhance)

- **字体**:优先使用 Maple Mono;未安装时自动回退到 PingFang SC / SF Mono / Menlo / 等宽字体,效果略有差异。推荐安装 [Maple Mono](https://github.com/subframe7536/maple-font) 获得完整观感。
- **余额 / 本轮成本 / 用量图表**:调用 DeepSeek 官方接口,需要当前 DSH 已配置 `DEEPSEEK_API_KEY` 凭据;未配置时这些信息显示为查询失败/不可用,不影响其余功能。
- 计价表按官方峰谷价(北京时间 9–12、14–18 高峰,其余空闲半价)硬编码,官方调价后需更新 `lib/index.js` 里的 `pricingFor`。

## 卸载

```bash
dsh plugin --profile web remove dsh-enhance
```

## License

MIT
