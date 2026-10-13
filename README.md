# dsh-ux

[![Listed on DSH Directory](https://dsh.directory/badges/listed.svg)](https://dsh.directory/plugins/jiangnanquan/dsh-ux)

**中文** | [English](README_EN.md)

DSH(DeepSeek Harness)Web 界面体验套件,包含两件东西:

| 部分 | 内容 |
|------|------|
| **dsh-enhance**(仓库根目录) | DSH 插件:设置页(即时开关)、主题、布局、折叠胶囊、账户用量。web profile 与官方桌面版都能装 |
| ~~**dsh-desktop**(`desktop/` 子目录)~~ | ~~无边框 Electron 桌面壳~~ **已废弃**:官方桌面版自带壳,不再需要 |

![dsh-enhance](screenshot.png)

## 能力(dsh-enhance)

| 类别 | 内容 |
|------|------|
| 设置页 | 设置面板左侧独立一页「界面增强」:每项功能一枚开关,改完**立即生效**,不用重启 |
| 字体 | 中文优先的 0.5 窄体等宽方案(更纱黑体 Mono/Term、Noto Mono CJK…),可切换字重;见下节 |
| 主题 | Solarized 浅色配色(深色保留官方默认) |
| 布局 | 加宽消息列、紧凑间距、收窄输入队列、禁用橡皮筋滚动 |
| 折叠胶囊 | 0.1.x：思考块聚合为 `Think ×N`、工具调用聚合为 `A → B → C` 链路胶囊，点击展开。0.2.0：官方过程分组接管显隐，插件把胶囊挂到可见的「已完成，用时 X」行下方做摘要，点击联动官方展开/收起；长链路按可用宽度换行，每行独立成胶囊 |
| 账户用量 | 底部显示官方账户余额、本轮 token 成本、近 30 天用量图表 |

长工具链会跟随消息列宽度自动重新分行，每个视觉行保持独立、完整的胶囊轮廓：

![工具链换行后每行独立胶囊](docs/images/tool-chain-multiline-capsules.png)

## 字体:中文优先 / 0.5 窄体西文

依据《终端排版哲学:中文优先与 0.5 窄体等宽工程实战》(本机实测数据见下表):

**汉字是不可妥协的 1.0 正方**。要让「2 个西文字符 = 1 个汉字」严格成立,西文就必须收窄到 **0.5**;
而以西文为基准的编程字体(Menlo、JetBrains Mono、Fira Code、Maple Mono……)西文宽 0.6~0.67,
汉字容器会被撑到 1.2 —— 汉字要么被横向拉宽 20%(矮胖、字怀塌陷),要么两边留白(中文词句涣散)。

本机 CoreText 实测(unitsPerEm=1000,字形前沿宽度):

| 字族 | 西文 `a` | 汉字 `中` | 比值 | `—` | `→` | `★` |
|------|---------|----------|------|-----|-----|-----|
| **Sarasa Mono SC** | 0.500 | 1.000 | **2.000** | 1.000 | 1.000 | 1.000 |
| **Sarasa Term SC** | 0.500 | 1.000 | **2.000** | 0.500 | 0.500 | 0.500 |
| Noto Sans Mono CJK SC | 0.500 | 1.000 | **2.000** | 0.894 | 1.000 | 1.000 |
| Sarasa Gothic / UI SC | 0.562 | 1.000 | 1.78 | 1.000 | 0.954 | 1.045 |
| Maple Mono NF CN | 0.600 | **1.200** | 2.000 | 0.600 | 0.600 | — |
| Maple Mono(非 CN) | 0.600 | 无字形 | — | 0.600 | 0.600 | — |

更纱黑体的架构正是这一哲学的产物:西文用 Iosevka(严格 0.5),汉字用思源黑体(1.0),
基线、x 高度、字重曲线都被逐像素对齐过。**Mono 与 Term 的唯一差别是东亚歧义字符**
(—……→★■●):Mono 保持全角(适合读 Markdown、中文标点),Term 压成半角(适合密集网格、
跳格最稳)。Maple Mono NF CN 的汉字被拉到 1.2,正是文章里要避开的那一类。

设置页里可选:

| 方案 | 说明 |
|------|------|
| 自动(推荐) | 按可用性依次尝试:更纱黑体 Mono → Term → Noto Mono CJK → Maple Mono;一款都没装就落回官方字体栈 |
| Sarasa Mono SC | 0.5 窄体 + 全角歧义字符 |
| Sarasa Term SC | 0.5 窄体 + 半角歧义字符 |
| Noto Mono CJK | Noto Sans Mono CJK SC,同为 0.5/1.0 |
| Maple Mono | 旧观感(西文 0.6 / 汉字 1.2),保留兼容 |
| 关闭 | 完全不动官方字体栈 |

本机装了哪几款会实时探测并标在页面上(未装的方案置灰,装了字体回来即可,无需重启)。
**字重**另有「标准 / 半粗」两档:半粗把正文抬到 600、强调抬到 700,用字族自带的矢量 SemiBold
(文章 §3.2 的甜点位);两种模式都同时关掉 `font-synthesis`,即文章 §3.1 的「不用算法级伪粗」——
伪粗是光栅化阶段向外描边,会挤占字怀、让笔画黏连。

页面底部还带一块**对齐自检块**(文章 §5 的校验文本,已按 2:1 校齐列宽):
第 1 行 40 个半角字符必须与第 2 行 20 个汉字等宽,方框必须是矩形,一眼就能看出方案对不对。

选型依据、实测数据、加新字族的步骤见 [docs/字体方案-中文优先与0.5窄体.md](docs/字体方案-中文优先与0.5窄体.md)。

## 设置(即时开关)

打开 **设置 → 界面增强**,这一页就是本插件的全部开关:

| 开关 | 关掉之后 |
|------|----------|
| 启用 dsh-ux 界面增强 | 总开关。整层增强立刻撤下、回到官方外观;各分项的选择保留,再打开时按原样回来 |
| 字体方案 / 字重 | 回官方字体栈与官方字重;方案选「关闭」等价于只关字体层 |
| Solarized 暖色配色 | 浅色回官方配色(深色一直用官方配色) |
| 紧凑布局微调 | 消息列宽、间距、输入卡片对齐都回官方几何 |
| 折叠胶囊 | 思考/工具调用恢复成官方逐条展开的样子,注入的胶囊节点同时被收回 |
| 账户余额与用量 | 输入框下方那行余额、本轮成本与图表消失,也不再轮询余额接口 |
| 诊断日志 | 停掉控制台里每 5 秒一次的 `[dsh-enhance-diag]` |

**全部即时生效,不需要重启**:开关写在 `<html>` 的 `data-dsh-ux-*` 属性上(CSS 闸门,改属性立刻改变行为),
同时存进一枚 cookie,让宿主半在首帧渲染前就把状态恢复好(否则会先按官方配色画一帧再跳)。

唯一需要重启的情况是**插件本体更新**:客户端半随页面刷新/热重载换新,宿主半(几个 `/enh/*` 接口、
首帧注入脚本)由 dsh 进程在启动时加载,换不了。设置页顶部会比对两半的构建号,一旦对不上就直接写明
「重启 DeepSeek Harness 后生效」,并提供「重新检测」。这也是 `GET /enh/ping` 的用途。

以前那行「dsh-ux 配色」占用的是官方**通用设置**里的一行,现已迁到这一页;老版本留下的配色 cookie
会被自动识别,并在首次写入时清掉。

## 安装

前置:已按 DSH 的 profile 机制运行(`dsh web`)。

```bash
dsh plugin --profile web add github:jiangnanquan/dsh-ux#main
```

本包声明了 `dsh.bundle.patch` 与 `dsh.client`,`dsh plugin add` 会自动把它加入 profile 的 bundles,**重启 dsh 后即生效**,无需手改任何配置。重复执行该命令是安全的(幂等);升级用 `dsh plugin --profile web update dsh-enhance`。

> **官方桌面版不使用这条命令**:`desktop` profile 由 Electron 应用独占,`dsh plugin --profile desktop …` 会被直接拒绝。桌面版装法见 [INSTALL.md](INSTALL.md#桌面版dsh-desktop安装)。

## 交给你的 AI

不想手动敲命令?把下面这段话粘贴给任意 AI agent(Claude Code、dsh、Gemini CLI……),让它读 INSTALL.md 并完成安装与自检:

> 请按照 https://github.com/jiangnanquan/dsh-ux/blob/main/INSTALL.md 里的步骤,在我的机器上安装并验证 dsh-enhance 插件(profile 用 web),然后运行文档里的健康检查并告诉我结果。如果任何一步失败,按文档的回滚步骤恢复原状并说明原因。

## 桌面版(dsh-desktop)

官方桌面版自带 dsh 运行时与 Electron 壳(`@deepseek-ai/dsh-desktop-host`),它使用独立的 `desktop` profile(`~/.dsh/profiles/desktop`,固定监听 `127.0.0.1:19387`)。装法与 web profile 不同,见 [INSTALL.md](INSTALL.md#桌面版dsh-desktop安装)。

> **本仓库的 `desktop/` 子目录(dsh-desktop 轻量封装)已废弃**:官方壳已经覆盖了它做的一切(无边框窗口、拉起后端、认证打通),不再需要安装。保留仅为历史参考,见 [desktop/README.md](desktop/README.md)。

## 依赖与前提(dsh-enhance)

- **字体**:推荐安装**更纱黑体**(Sarasa Gothic 的 `Sarasa-SuperTTC`,或 `Sarasa Term/Mono SC` 单独字重)——
  它是唯一同时满足「西文 0.5 窄体 + 汉字 1.0 正方」且中西文字重曲线对齐过的免费字族。
  没有更纱时可用 [Noto Sans Mono CJK SC](https://github.com/notofonts/noto-cjk)(同为 0.5/1.0,但只有 Regular/Bold),
  或继续用 [Maple Mono](https://github.com/subframe7536/maple-font)(西文 0.6、汉字 1.2)。
  一款都没装时字体层自动落回官方字体栈,不影响其余功能。
- **余额 / 本轮成本 / 用量图表**:调用 DeepSeek 官方接口,需要当前 DSH 已配置 `DEEPSEEK_API_KEY` 凭据;未配置时这些信息显示为查询失败/不可用,不影响其余功能。
- 计价表按官方峰谷价(北京时间 9–12、14–18 高峰,其余空闲半价)硬编码,官方调价后需更新 `lib/index.js` 里的 `pricingFor`。

## 卸载

```bash
dsh plugin --profile web remove dsh-enhance
```

## License

MIT
