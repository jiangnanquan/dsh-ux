# INSTALL.md — dsh-enhance 安装契约(AI agent 可执行)

本文档是 `dsh-enhance` 的机器可读安装契约,供 AI agent(Claude Code、dsh、Gemini CLI 等)或人工照此执行。每一步都是**确定性命令**,重复执行安全。

**目标**:在用户的 `web` profile 上安装本插件,验证配置树与运行状态,失败时干净回滚。

## 1. 前置检查

逐条执行,任一不满足则停止并报告:

```bash
# 1.1 dsh CLI 可用
npx --yes @deepseek-ai/dsh --version

# 1.2 web profile 存在
test -f ~/.dsh/profiles/web/package.json && echo "profile web OK"

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

## 3. 机器验证(不依赖 UI)

```bash
# 3.1 bundles 已自动写入(输出必须含 dsh-enhance)
node -e 'const p=require(process.env.HOME+"/.dsh/profiles/web/package.json");const b=p.dsh?.profile?.bundles||[];console.log(b.includes("dsh-enhance")?"bundles ✓":"bundles ✗ 缺失,回看第 2 步")'

# 3.2 配置树已合成 dsh-enhance 行
dsh --profile web --dump-config | grep -i "dsh-enhance"
```

两项都有输出 = 安装成功。

## 4. 运行健康检查

重启 dsh web 后:

```bash
# 4.1 host 半(余额路由)已注册。端口以你 dsh web 实际监听为准(本仓库桌面壳默认 3080)。
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3080/enh/balance
```

- 返回 `200`(JSON)= host 半正常且凭据有效;
- 返回 `4xx/5xx` 的 JSON 错误体 = host 半已加载但凭据未配置或 API 失败(见第 1.3 条);
- 返回 `404` = host 半未加载,回到第 2 步排查。

浏览器控制台 `[dsh-enhance-diag]` 日志应无红色报错(静置时 scan/rebuild 计数为 0)。

## 5. 回滚

```bash
dsh plugin --profile web remove dsh-enhance
```

此命令同时从 profile 的 `dsh.profile.bundles` 移除声明,重启 dsh 后完全恢复。

## 6. 已知边界(agent 判断用)

- **计价表硬编码**:`lib/index.js` 的 `pricingFor` 按官方峰谷价(北京时间 9–12、14–18 高峰,其余半价;2026-08-17 起新价)写死,官方调价后需人工更新——AI 不可自行假设当前价格仍准确。
- **DOM 依赖**:折叠胶囊依赖 `data-chat-flow`、`data-tool`、`data-variant="think"` 等属性名,DSH 升级若改这些属性,折叠功能静默失效但不影响其余功能。
- **凭据**:API key 通过 `credentials.resolve("DEEPSEEK_API_KEY")` 运行时解析,本插件从不读取/存储 key 文件。
- **平台**:插件本体与平台无关;仓库内 `desktop/` 桌面壳仅支持 macOS。
