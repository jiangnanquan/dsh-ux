#!/bin/zsh
# =============================================================
#  DSH 桌面壳依赖升级器（双击运行）
#  行为：对比 registry 最新版 → 升级 @deepseek-ai/dsh（精确锁版）
#        与 electron，失败自动回滚 package.json / lock
#  与「启动 DSH.command」分开：启动器只管启动，本脚本只管升级
# =============================================================

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR" || exit 1
PORT=3080
URL="http://127.0.0.1:${PORT}"
BAK_PKG=/tmp/dsh-upgrade.package.json.bak
BAK_LOCK=/tmp/dsh-upgrade.lock.bak

command -v npm >/dev/null 2>&1 || {
  echo "❌ 未找到 npm，请先安装 Node.js（或检查 fnm/nvm 初始化）"
  exit 1
}

echo "🔍 查询最新版本…"
# 去掉 ^ / ~ 前缀再比较（registry 返回的是裸版本号）
LOCAL_DSH=$(node -p "require('./package.json').dependencies['@deepseek-ai/dsh'].replace(/^[\\^~]/,'')" 2>/dev/null || echo "?")
LOCAL_EL=$(node -p "require('./package.json').devDependencies.electron.replace(/^[\\^~]/,'')" 2>/dev/null || echo "?")
LATEST_DSH=$(npm view @deepseek-ai/dsh version 2>/dev/null)
LATEST_EL=$(npm view electron version 2>/dev/null)

if [[ -z "$LATEST_DSH" || -z "$LATEST_EL" ]]; then
  echo "❌ 查询 npm registry 失败，请检查网络后重试"
  read "?按回车键关闭窗口…"
  exit 1
fi

echo "  当前：dsh $LOCAL_DSH ｜ electron $LOCAL_EL"
echo "  最新：dsh $LATEST_DSH ｜ electron $LATEST_EL"

if [[ "$LOCAL_DSH" == "$LATEST_DSH" && "$LOCAL_EL" == "$LATEST_EL" ]]; then
  echo "✅ 已是最新，无需升级"
  read "?按回车键关闭窗口…"
  exit 0
fi

if curl -sf -o /dev/null --max-time 1 "$URL" 2>/dev/null; then
  echo "⚠️ 检测到 dsh 正在运行（$URL），升级完成后请重启 dsh 使新版本生效"
fi

echo "⬆️ 开始升级…"
cp package.json "$BAK_PKG"
cp package-lock.json "$BAK_LOCK"

RC=0
if [[ "$LOCAL_DSH" != "$LATEST_DSH" ]]; then
  npm install --save-exact "@deepseek-ai/dsh@$LATEST_DSH" || RC=1
fi
if [[ $RC -eq 0 && "$LOCAL_EL" != "$LATEST_EL" ]]; then
  npm install --save-dev "electron@$LATEST_EL" || RC=1
fi

if [[ $RC -ne 0 ]]; then
  echo "❌ 升级失败，正在回滚…"
  cp "$BAK_PKG" package.json
  cp "$BAK_LOCK" package-lock.json
  echo "   已恢复 package.json / package-lock.json"
  echo "   如 node_modules 状态异常，请重新执行本脚本或手动 npm install"
  read "?按回车键关闭窗口…"
  exit 1
fi

NEW_DSH=$(node -p "require('./package.json').dependencies['@deepseek-ai/dsh'].replace(/^[\\^~]/,'')")
NEW_EL=$(node -p "require('./package.json').devDependencies.electron.replace(/^[\\^~]/,'')")
echo "✅ 升级完成：dsh $LOCAL_DSH → $NEW_DSH，electron $LOCAL_EL → $NEW_EL"
rm -f "$BAK_PKG" "$BAK_LOCK"
read "?按回车键关闭窗口…"
