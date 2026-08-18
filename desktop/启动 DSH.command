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

# 优先用本地锁定的依赖（npm install 后秒开）；缺失时回退 npx（首次约 2 分钟）
DSH_BIN="$DIR/node_modules/.bin/dsh"
if [[ -x "$DSH_BIN" ]]; then
  DSH_CMD="$DSH_BIN"
else
  echo "⚠️ 未找到本地依赖 node_modules/.bin/dsh，回退 npx（首次需下载，约 2 分钟）"
  echo "   建议先执行：cd \"$DIR\" && npm install"
  DSH_CMD=(npx --yes @deepseek-ai/dsh)
fi

stop_backend() {
  local pid
  pid=$(cat "$PIDFILE" 2>/dev/null)
  [[ -n "$pid" ]] && kill "$pid" 2>/dev/null
  pkill -f "dsh web --port $PORT" 2>/dev/null
  pkill -f "@deepseek-ai/dsh.*web --port $PORT" 2>/dev/null
}

if is_up; then
  echo "✅ dsh 已在运行：$URL（直接复用）"
  DSH_PID=""
else
  echo "⏳ 启动 dsh web 后端…"
  if [[ -x "$DSH_BIN" ]]; then
    "$DSH_BIN" web --port "$PORT" >"$LOG" 2>&1 &
  else
    "${DSH_CMD[@]}" web --port "$PORT" >"$LOG" 2>&1 &
  fi
  echo $! > "$PIDFILE"
  for i in {1..300}; do is_up && break; sleep 0.5; done
  if ! is_up; then
    echo "❌ dsh 启动失败（等待 150 秒超时），最近日志："
    [[ -s "$LOG" ]] && tail -15 "$LOG" || echo "（日志为空——npx 可能仍在下载安装中）"
    stop_backend
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
  stop_backend
  echo "🛑 已停止本次启动的 dsh 后端"
fi

echo "👋 已退出 (RC=$RC)"
exit $RC
