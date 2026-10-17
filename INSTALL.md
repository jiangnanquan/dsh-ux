# INSTALL.md — dsh-enhance 安装契约(AI agent 可执行)

本文档是 `dsh-enhance` 的机器可读安装契约,供 AI agent(Claude Code、dsh、Gemini CLI 等)或人工照此执行。每一步都是**确定性命令**,重复执行安全。

**目标**:在用户的 `web` profile 或官方桌面版的 `desktop` profile 上安装本插件,验证配置树与运行状态,失败时干净回滚。

**两条路互不通用**:`web` 走第 1–2 步(`dsh plugin`);**官方桌面版走第 2b 步**——它由 Electron 应用独占,`dsh plugin --profile desktop …` 会被直接拒绝。先判断用户装在哪里,再从对应的小节往下走。

## 1. 前置检查

先判断目标:**用户是让你装进官方桌面版,还是装进自己的 `dsh web`?** 桌面版走 §2b,其余走 §2。

```bash
# 1.0 判断目标(桌面版在跑 → 走 §2b)
pgrep -fl "dsh-desktop-host" >/dev/null && echo "检测到官方桌面版 → 走第 2b 步" || echo "无桌面版 → 走第 2 步"

# 1.1 dsh CLI 可用(桌面版内置的 CLI 在 App 内,不依赖 PATH)
npx --yes @deepseek-ai/dsh --version

# 1.2 目标 profile 存在
test -f ~/.dsh/profiles/web/package.json && echo "profile web OK"
test -f ~/.dsh/profiles/desktop/package.json && echo "profile desktop OK"

# 1.3 (可选) 余额/用量功能需要 DeepSeek 凭据;没有则仅该功能不可用,不影响安装
dsh --profile web --dump-config 2>/dev/null | grep -qi "DEEPSEEK_API_KEY" && echo "key OK" || echo "key 未配置(余额功能将不可用)"
```

## 2. 安装

```bash
dsh plugin --profile web add github:jiangnanquan/dsh-ux#main
```

- **幂等**:已安装时重复执行安全(pnpm 语义),升级用 `dsh plugin --profile web update dsh-enhance`。
- **生产环境建议固定 commit**:`dsh plugin --profile web add github:jiangnanquan/dsh-ux#<commit-sha>`。
- 本仓库 `lib/` 已提交且无 `prepare` 脚本,**无需构建、无需配置 pnpm `allowBuilds`**。

## 2b. 桌面版(dsh-desktop)安装

官方桌面版(`/Applications/DeepSeek Harness.app`)自带 dsh 运行时与 Electron 壳,使用独立的 `desktop` profile(`~/.dsh/profiles/desktop`,固定监听 `127.0.0.1:19387`)。这个 profile 由应用独占:

```bash
dsh plugin --profile desktop add github:jiangnanquan/dsh-ux#main
# error: profile "desktop" is managed exclusively by the Electron application
```

系统里的 dsh CLI 与桌面版内置的 dsh CLI **都会**拒绝这个名字,所以第 2 步在桌面版上不成立。

### 2b.1 应用内安装(推荐)

桌面版侧边栏 **Plugins / 插件** 页面安装同一 spec。该页面用应用自带的 pnpm 写入依赖与 bundles,并执行同一套 peer 版本校验——校验不过会在页面上直接报错,不会留下半装状态。

### 2b.2 手工安装(agent 可执行,`link:` 开发态用)

桌面版 App **只加载已装好的 profile,不代为安装依赖**,所以依赖必须自己落盘。必须用桌面版自带的 pnpm,不要用 `PATH` 上的 pnpm。

```bash
APP="/Applications/DeepSeek Harness.app"
PROFILE="$HOME/.dsh/profiles/desktop"

# 2b.2.1 声明依赖与 bundle(改 JSON,不要用 dsh plugin)
#   dependencies 增加一行:  "dsh-enhance": "link:/absolute/path/to/dsh-ux"
#   dsh.profile.bundles 末尾追加:  "dsh-enhance"

# 2b.2.2 用桌面版自带 pnpm 落盘依赖(产出 node_modules/dsh-enhance 符号链接 + pnpm-lock.yaml)
ELECTRON_RUN_AS_NODE=1 "$APP/Contents/MacOS/DeepSeek Harness" \
  "$APP/Contents/Resources/runtime/pnpm/bin/pnpm.mjs" \
  --dir "$PROFILE" install

# 2b.2.3 重启桌面版
#   新增依赖不会热加载:运行中的实例即使组合里带了 dsh-hmr,也要等进程重启
#   重建 runtime resolution 之后插件才会真正挂上。
```

改动前先备份 `$PROFILE/package.json`。App 自己也会维护这个清单(它会追加自己需要的官方 bundle),所以改完请立刻回读一次确认没有被覆盖。

## 3. 机器验证(不依赖 UI)

```bash
# 3.1 bundles 已自动写入(输出必须含 dsh-enhance)
node -e 'const p=require(process.env.HOME+"/.dsh/profiles/web/package.json");const b=p.dsh?.profile?.bundles||[];console.log(b.includes("dsh-enhance")?"bundles ✓":"bundles ✗ 缺失,回看第 2 步")'

# 3.2 配置树已合成 dsh-enhance 行
dsh --profile web --dump-config | grep -i "dsh-enhance"
```

两项都有输出 = 安装成功。

## 3b. 机器验证(桌面版)

无法用系统 `dsh` 直接对 `desktop` profile 做 `--dump-config`(同样被独占拒绝),所以复制成临时 profile 名后用**桌面版内置的 dsh** 组合:

```bash
APP="/Applications/DeepSeek Harness.app"
PROFILE="$HOME/.dsh/profiles/desktop"
CHECK="$HOME/.dsh/profiles/dshux-check"

# 3b.1 bundles 已声明
node -e 'const p=require(process.env.HOME+"/.dsh/profiles/desktop/package.json");const b=p.dsh?.profile?.bundles||[];console.log(b.includes("dsh-enhance")?"bundles ✓":"bundles ✗ 缺失,回看第 2b 步")'

# 3b.2 依赖已落盘(应打印一条指向本仓库的符号链接)
ls -l "$PROFILE/node_modules/dsh-enhance"

# 3b.3 组合里出现插件行,且 stderr 为空
rm -rf "$CHECK" && cp -R "$PROFILE" "$CHECK"
ELECTRON_RUN_AS_NODE=1 "$APP/Contents/MacOS/DeepSeek Harness" \
  "$APP/Contents/Resources/app.asar/dsh/node_modules/@deepseek-ai/dsh/lib/bin.js" \
  --profile dshux-check --dump-config | grep -A1 "== dsh-enhance"
rm -rf "$CHECK"   # 只删刚复制出来的临时 profile
```

**stderr 必须为空**:出现 `skipped bundle` / `denied` 说明 peer 版本不匹配(见 §6),插件装上了也不会加载。

## 4. 运行健康检查

重启 dsh 或桌面版后:

```bash
# web:端口以你 dsh web 实际监听为准(默认 3080)
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3080/enh/ping
curl -s http://127.0.0.1:3080/enh/ping   # 期望 {"ok":true,"build":"<package.json 版本>",...}

# 桌面版:固定 19387
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:19387/enh/ping
```

- `/enh/ping` 返回 `200` = **宿主半已加载**,`build` 就是当前进程里的宿主半版本;设置页拿它跟
  客户端半的 `CLIENT_BUILD` 比对,不一致就在页面顶部提示「重启 DeepSeek Harness 后生效」。
- 返回 `404` = 宿主半未加载(或仍是 1.1.0 及更早的版本,那时还没有这条路由),回到第 2 步排查;
  只在**插件刚装/刚更新**时需要重启,平时开关功能不需要。
- 余额能不能查还要看凭据:

```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3080/enh/balance
```

  - 返回 `200`(JSON)= 凭据有效;
  - 返回 `4xx/5xx` 的 JSON 错误体 = host 半已加载但凭据未配置或 API 失败(见第 1.3 条);
  - 返回 `404` = host 半未加载。

### 4b. 开关自检(打开设置 → 界面增强)

- 顶部状态行:构建号一致 → 「宿主半已同步」;不一致或 404 → 黄条提示重启,带「重新检测」。
- 每个开关拨一下应**立即**生效,不需要重启:配色主题/布局是 CSS 闸门,字体方案与字重只改
  `<html data-dsh-ux-font>` / `data-dsh-ux-fontweight>`,折叠胶囊会即时注入或收回 DOM 节点,
  余额那一行会即时出现或消失。
- **字体方案**:页面上会列出本机探测结果(装了 ✓ / 没装 ✗),未装的方案置灰。切到某一档后,
  下方的「对齐自检块」里第 1 行(40 个半角字符)与第 2 行(20 个汉字)必须等宽、方框必须是矩形;
  对不齐就说明该字族不是 0.5 窄体(见下一条)。选 Mono/Term 的差别看第 3 行(歧义字符):
  Mono 下与第 1 行等宽,Term 下只有一半。
- 关掉总开关应回到官方外观;再打开时各分项保持原样(状态存在 cookie:键名 `dsh-enhance-config`)。
- 不想点 UI 也可直接看 `<html>` 上的 `data-dsh-ux` / `data-dsh-ux-<键>` 属性是否随之翻转。

### 4c. 机器自检(不需要启动 dsh,纯 Node)

```bash
node test/smoke.mjs
```

覆盖:客户端半的开关状态机(属性/cookie 往返、枚举归一化)、每条 CSS 闸门是否存在、字体方案的
家族栈与字重变量、字体探测与「未装即置灰」、对齐自检块的列宽不变量、注册进哪个插槽(必须是
`settings.section` 而不是 `settings.general.item`)、宿主半的四条路由、首帧注入脚本与客户端半的口径
(含字体枚举的白名单校验)、以及设置页顶部那条「要不要重启」的探测逻辑。装完/改完插件跑一遍,
25 项应全绿。

## 5. 回滚

```bash
# web
dsh plugin --profile web remove dsh-enhance
```

此命令同时从 profile 的 `dsh.profile.bundles` 移除声明,重启 dsh 后完全恢复。

桌面版只能手工回滚(应用独占,CLI 进不去):

```bash
APP="/Applications/DeepSeek Harness.app"
PROFILE="$HOME/.dsh/profiles/desktop"
# 5b.1 从 dependencies 删掉 dsh-enhance,并从 dsh.profile.bundles 删掉 "dsh-enhance"
# 5b.2 用桌面版自带 pnpm prune 掉符号链接
ELECTRON_RUN_AS_NODE=1 "$APP/Contents/MacOS/DeepSeek Harness" \
  "$APP/Contents/Resources/runtime/pnpm/bin/pnpm.mjs" --dir "$PROFILE" install
# 5b.3 重启桌面版
```

## 6. 已知边界(agent 判断用)

- **开关状态存 cookie**:`dsh-enhance-config`(URL-encoded JSON,含 `master` + 各分项布尔值 + 两个枚举
  `font` / `fontweight`)。宿主半在 index 注入的首帧脚本读它、在任何渲染前把状态写到 `<html data-dsh-ux-*>`
  上;客户端半改开关时写同一批属性并回写 cookie。**布尔属性的语义是「总开关 && 分项」的合取**,所以分项
  原始选择只在 cookie 里 —— 定位「开关不生效」时先看属性对不对,再看 cookie 内容;删掉 cookie 等于回到
  默认(布尔全开、字体方案 auto、字重 regular)。旧版单键 `dsh-enhance-theme=off` 与旧版布尔
  `font: true/false` 都仍被识别,并在下一次写入时收敛成枚举值。
- **字体方案是枚举,不是布尔**:`data-dsh-ux-font` ∈ `off | auto | sans-mono | sans-term | noto | maple`,
  `data-dsh-ux-fontweight` ∈ `regular | semibold`。**这两组白名单在 `lib/index.js`(首帧脚本)和
  `lib/client.js`(state 归一化)各有一份,必须同集合** —— 加方案时两处一起改,`test/smoke.mjs` 里有一条
  用例专门盯这个。越界值一律回落默认(auto/regular),不会把变量写坏。
- **字体族名与探测**:方案候选族名写死在 `FONT_SCHEMES`(如 `"Sarasa Mono SC"`)。探测用 canvas 量宽度、
  以「明确不存在的族名 + monospace」当基线比对(`familyInstalled`),拉丁与汉字各探一次取或 —— 这比拿
  monospace/serif 当基线稳(Menlo 与 Maple Mono 的拉丁宽都是 0.6,容易误判)。**若某台机器上 CoreText 暴露的
  族名不同**(更纱 SuperTTC 的族名随发布方式变化,单字重 TTF 可能叫 `Sarasa Term SC SemiBold`),
  页面会显示「未安装」,此时把族名加进 `FONT_SCHEMES[].families` 即可 —— 不要靠猜。
- **0.5 规则是硬指标**:方案的家族栈里只放西文 0.5 的 CJK 等宽字体(更纱 Iosevka / Noto Sans Mono CJK)。
  加入西文 0.6 的字族(如 Maple Mono)会把汉字撑到 1.2,页面上的对齐自检块立刻能看出方框歪斜 ——
  这属于**预期内的现象**,不是渲染 bug。
- **插件本体更新需要重启**:客户端半(`lib/client.js`)随页面刷新/客户端热重载换新,宿主半
  (`lib/index.js`:4 条 `/enh/*` 路由 + 首帧注入脚本)由 dsh 进程启动时加载、无法热更新。两半构建号
  不一致时设置页会提示重启 —— 这是设计内的行为,不是缺陷。校验方式:`/enh/ping` 的 `build` 字段 vs
  `lib/client.js` 里的 `CLIENT_BUILD` vs `package.json.version`,三者必须相同(升版时一起改)。
- **计价表硬编码**:`lib/index.js` 的 `pricingFor` 按官方峰谷价(北京时间 9–12、14–18 高峰,其余半价;2026-08-17 起新价)写死,官方调价后需人工更新——AI 不可自行假设当前价格仍准确。
- **DOM 依赖**:折叠胶囊 0.1.x 依赖 `data-chat-flow`、`data-tool`、`data-variant="think"` 等属性名；0.2.0 依赖官方过程分组契约 `data-step-process-content` / `data-chat-group-key` / `data-chat-turn` / `data-chat-flow-kind="turn-process"`（挂载点只认 `data-*`，不绑 CSS Module 哈希类名）。DSH 升级若改这些属性，折叠功能会自禁用并回落到不影响其余功能的空转状态。
- **凭据**:API key 通过 `credentials.resolve("DEEPSEEK_API_KEY")` 运行时解析,本插件从不读取/存储 key 文件。
- **余额接口的根**:`resolveBaseURL` 读 `llm-deepseek` 当前生效的 `baseURL`,再剥掉 `/anthropic`、`/anthropic/v1`、`/v1` 等接口后缀得到接口根(余额在 OpenAI 兼容根的 `/user/balance` 上)。两代 settings 服务形状不同——0.1.x 走 `settings.get(section)`,0.2.0 走 `settings.describe()` 的 volatile 表单投影(该字段恰好声明为 volatile);两条路都取不到时回落 `https://api.deepseek.com`。若用户把对话端点指向不带这些后缀的自建路径,余额接口会被拼到错误的根上。
- **peer 版本闸门**:dsh 在加载 bundle 前校验 `@deepseek-ai/dsh-*` 的 `peerDependencies`(含 prerelease),不满足的 bundle 会被**跳过并记入 `skippedBundles`**——装上了也不加载。当前范围是 `^0.1.0-rc.6 || ^0.2.0-rc.2`,dsh 0.3 起需要重新适配。
- **平台**:插件本体与平台无关。仓库内 `desktop/` 那套 Electron 轻量封装**已废弃**(官方桌面版自带壳,不再需要安装),仅作历史参考。
