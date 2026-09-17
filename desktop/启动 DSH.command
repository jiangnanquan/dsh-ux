#!/bin/zsh
# =============================================================
#  DSH 沉浸式桌面启动器（双击运行）
#  行为：dsh web 后端未运行时自动拉起 → 打开无边框沉浸式窗口
#        关窗后自动停掉本次拉起的后端（不影响你自己开的 dsh）
#  快捷键：Cmd+Q 退出 | Cmd+Shift+F / F11 全屏 | Cmd+R 重载
#  悬浮钮：右上角（指针靠近显现）— 全屏 / 最小化 / 关闭
#  环境变量：DSH_PORT 指定端口（默认 3080）
# =============================================================

DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${DSH_PORT:-3080}"
URL="http://127.0.0.1:${PORT}"
LOG=/tmp/dsh-web.log
PIDFILE=/tmp/dsh-web.pid

# 0.1.5 起 dsh web 的浏览器入口要求认证：无 cookie 请求 / 得到 401。
# 所以「后端在不在」不能再用 curl -f 判断（401 会让 -f 判失败 ⇒ 误判成没启动，
# 于是重复拉起一个抢不到端口的后端，白等 150 秒）。
# 只要能拿到任何 HTTP 状态码，就说明端口在监听。
http_status() { curl -s -o /dev/null -w '%{http_code}' --max-time 1 "$URL" 2>/dev/null }
is_up() { [[ "$(http_status)" == [1-5][0-9][0-9] ]] }

# 认证入口：dsh 启动时打印的 http://127.0.0.1:<port>/?token=… 是官方入口，
# 壳拿它换 dsh-auth-* 会话 cookie（303 → Set-Cookie）。
auth_url() { grep -o "http://127\.0\.0\.1:${PORT}/?token=[A-Za-z0-9_-]*" "$LOG" 2>/dev/null | tail -1 }

# 优先用本地锁定的依赖（npm install 后秒开）；缺失时回退 npx（首次约 2 分钟）
DSH_BIN="$DIR/node_modules/.bin/dsh"
if [[ -x "$DSH_BIN" ]]; then
  DSH_CMD=("$DSH_BIN")
else
  echo "⚠️ 未找到本地依赖 node_modules/.bin/dsh，回退 npx（首次需下载，约 2 分钟）"
  echo "   建议先执行：cd \"$DIR\" && npm install"
  DSH_CMD=(npx --yes @deepseek-ai/dsh)
fi

# --no-open：0.1.5 起 dsh web 默认会把 Web UI 再塞给系统默认浏览器；
#            桌面壳自己就是那个浏览器，不要多开一个。
start_backend() {
  : > "$LOG"
  "${DSH_CMD[@]}" web --no-open --port "$PORT" >"$LOG" 2>&1 &
  echo $! > "$PIDFILE"
}

stop_backend() {
  local pid
  pid=$(cat "$PIDFILE" 2>/dev/null)
  [[ -n "$pid" ]] && kill "$pid" 2>/dev/null
  # npx / node 包装层可能留下子进程，按命令行兜底清理（只匹配本端口）
  pkill -f "dsh web --no-open --port $PORT" 2>/dev/null
  pkill -f "dsh web --port $PORT" 2>/dev/null
  pkill -f "@deepseek-ai/dsh.*web .*--port $PORT" 2>/dev/null
}

DSH_AUTH_URL=""
export DSH_AUTH_URL
# 壳的等待探测与 cookie authority 都取自 DSH_URL：DSH_PORT 改了端口就必须一起带上，
# 否则壳会连到默认 3080（串到别的实例上去）。DSH_URL 显式设置时以用户为准。
export DSH_URL="${DSH_URL:-$URL}"

if is_up; then
  echo "✅ dsh 已在运行：$URL（直接复用）"
  DSH_PID=""
else
  echo "⏳ 启动 dsh web 后端…"
  start_backend
  for i in {1..300}; do is_up && break; sleep 0.5; done
  if ! is_up; then
    echo "❌ dsh 启动失败（等待 150 秒超时），最近日志："
    [[ -s "$LOG" ]] && tail -15 "$LOG" || echo "（日志为空——npx 可能仍在下载安装中）"
    stop_backend
    exit 1
  fi
  DSH_PID=$(cat "$PIDFILE" 2>/dev/null)
  # token 行与「端口就绪」几乎同时出现，短暂等待把它捞出来
  for i in {1..20}; do
    DSH_AUTH_URL="$(auth_url)"
    [[ -n "$DSH_AUTH_URL" ]] && break
    sleep 0.25
  done
  if [[ -n "$DSH_AUTH_URL" ]]; then
    echo "✅ dsh 就绪：$URL（已取得本次进程的认证入口）"
  else
    echo "✅ dsh 就绪：$URL（未发现 token 入口：老版本 dsh 或日志被改写）"
  fi
fi

ELECTRON="$DIR/node_modules/.bin/electron"
if [[ ! -x "$ELECTRON" ]]; then
  echo "❌ 未找到 Electron：请先执行 cd \"$DIR\" && npm install"
  [[ -n "$DSH_PID" ]] && stop_backend
  exit 1
fi

echo "🚀 打开沉浸式窗口…"
"$ELECTRON" "$DIR/main.js"
RC=$?

# 壳退出后，停掉本次拉起的 dsh 后端（连带 npx/node 子进程）
if [[ -n "$DSH_PID" ]]; then
  kill "$DSH_PID" 2>/dev/null
  sleep 1
  stop_backend
  echo "🛑 已停止本次启动的 dsh 后端"
fi

echo "👋 已退出 (RC=$RC)"
exit $RC
