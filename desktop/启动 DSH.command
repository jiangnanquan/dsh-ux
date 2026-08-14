#!/bin/zsh
# =============================================================
#  DSH 沉浸式桌面启动器（双击运行）
#  行为：dsh web 后端未运行时自动拉起 → 打开无边框沉浸式窗口
#        关窗后自动停掉本次拉起的后端（不影响你自己开的 dsh）
#  快捷键：Cmd+Q 退出 | Cmd+Shift+F / F11 全屏
#  悬浮钮：右上角（悬停显现）— 全屏 / 最小化 / 关闭
# =============================================================

DIR="$(cd "$(dirname "$0")" && pwd)"
PORT=3080
URL="http://127.0.0.1:${PORT}"
LOG=/tmp/dsh-web.log
PIDFILE=/tmp/dsh-web.pid

is_up() { curl -sf -o /dev/null --max-time 1 "$URL" 2>/dev/null; }

if is_up; then
  echo "✅ dsh 已在运行：$URL（直接复用）"
  DSH_PID=""
else
  echo "⏳ 启动 dsh web 后端…"
  (npx --yes @deepseek-ai/dsh web --port "$PORT" >"$LOG" 2>&1 & echo $! > "$PIDFILE")
  for i in {1..40}; do is_up && break; sleep 0.5; done
  if ! is_up; then
    echo "❌ dsh 启动失败，最近日志："
    tail -15 "$LOG"
    exit 1
  fi
  echo "✅ dsh 就绪：$URL"
  DSH_PID=$(cat "$PIDFILE" 2>/dev/null)
fi

echo "🚀 打开沉浸式窗口…"
"$DIR/node_modules/.bin/electron" "$DIR/main.js"
RC=$?

# 壳退出后，停掉本次拉起的 dsh 后端（连带 npx/node 子进程）
if [[ -n "$DSH_PID" ]]; then
  kill "$DSH_PID" 2>/dev/null
  sleep 1
  pkill -f "@deepseek-ai/dsh.*--port $PORT" 2>/dev/null
  pkill -f "dsh web --port $PORT" 2>/dev/null
  echo "🛑 已停止本次启动的 dsh 后端"
fi

echo "👋 已退出 (RC=$RC)"
exit $RC
