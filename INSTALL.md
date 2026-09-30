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
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3080/enh/balance

# 桌面版:固定 19387
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:19387/enh/balance
```

- 返回 `200`(JSON)= host 半正常且凭据有效;
- 返回 `4xx/5xx` 的 JSON 错误体 = host 半已加载但凭据未配置或 API 失败(见第 1.3 条);
- 返回 `404` = host 半未加载,回到第 2 步排查。

浏览器控制台 `[dsh-enhance-diag]` 日志应无红色报错(静置时 scan/rebuild 计数为 0)。

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

- **计价表硬编码**:`lib/index.js` 的 `pricingFor` 按官方峰谷价(北京时间 9–12、14–18 高峰,其余半价;2026-08-17 起新价)写死,官方调价后需人工更新——AI 不可自行假设当前价格仍准确。
- **DOM 依赖**:折叠胶囊依赖 `data-chat-flow`、`data-tool`、`data-variant="think"` 等属性名,DSH 升级若改这些属性,折叠功能静默失效但不影响其余功能。
- **凭据**:API key 通过 `credentials.resolve("DEEPSEEK_API_KEY")` 运行时解析,本插件从不读取/存储 key 文件。
- **余额接口的根**:`resolveBaseURL` 读 `llm-deepseek` 当前生效的 `baseURL`,再剥掉 `/anthropic`、`/anthropic/v1`、`/v1` 等接口后缀得到接口根(余额在 OpenAI 兼容根的 `/user/balance` 上)。两代 settings 服务形状不同——0.1.x 走 `settings.get(section)`,0.2.0 走 `settings.describe()` 的 volatile 表单投影(该字段恰好声明为 volatile);两条路都取不到时回落 `https://api.deepseek.com`。若用户把对话端点指向不带这些后缀的自建路径,余额接口会被拼到错误的根上。
- **peer 版本闸门**:dsh 在加载 bundle 前校验 `@deepseek-ai/dsh-*` 的 `peerDependencies`(含 prerelease),不满足的 bundle 会被**跳过并记入 `skippedBundles`**——装上了也不加载。当前范围是 `^0.1.0-rc.6 || ^0.2.0-rc.2`,dsh 0.3 起需要重新适配。
- **平台**:插件本体与平台无关。仓库内 `desktop/` 那套 Electron 轻量封装**已废弃**(官方桌面版自带壳,不再需要安装),仅作历史参考。
