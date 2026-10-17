/**
 * dsh-enhance 冒烟测试（无需启动 dsh / 桌面版）。
 *
 * 覆盖三件在真机上很难反复验证的事：
 *   1. 客户端半的开关状态机：属性/cookie → store → 属性 + cookie 的往返；
 *   2. CSS 闸门：每个功能块都必须挂在 html[data-dsh-ux-*] 上，否则「关掉」不起作用；
 *   3. 宿主半的首帧注入脚本：与客户端半写出的属性完全一致，且 /enh/ping 报出的构建号
 *      与 package.json 及客户端 CLIENT_BUILD 相同（「要不要重启」的判据就是它）。
 *
 * 跑法：node test/smoke.mjs
 */
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import assert from 'node:assert/strict'

const root = new URL('../', import.meta.url)
const read = (rel) => readFileSync(new URL(rel, root), 'utf8')

let passed = 0
const pending = []
const ok = (name) => { passed += 1; console.log('  ✓ ' + name) }
const fail = (name, error) => {
  console.error('  ✗ ' + name)
  console.error(error && error.stack ? error.stack : error)
  process.exitCode = 1
}
const test = (name, fn) => {
  try {
    const result = fn()
    // 异步用例延后结算，末尾统一等待（否则 assert 失败会变成 unhandled rejection）
    if (result !== null && typeof result === 'object' && typeof result.then === 'function') {
      pending.push(result.then(() => ok(name), (error) => fail(name, error)))
      return
    }
    ok(name)
  } catch (error) {
    fail(name, error)
  }
}

/* ------------------------------------------------------------------ 假 DOM */

function createDom(initialAttributes = {}) {
  const attributes = new Map(Object.entries(initialAttributes))
  const appended = []
  const listeners = new Map()
  const cookieLog = []
  const element = (tag = 'div') => ({
    tagName: tag,
    className: '',
    dataset: {},
    style: {},
    textContent: '',
    innerHTML: '',
    children: [],
    isConnected: false,
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    setAttribute(k, v) { this[k] = v },
    getAttribute: () => null,
    appendChild() {},
    append() {},
    replaceChildren() {},
    remove() {},
    querySelector: () => null,
    querySelectorAll: () => [],
    closest: () => null,
  })
  const document = {
    documentElement: {
      getAttribute: (k) => (attributes.has(k) ? attributes.get(k) : null),
      setAttribute: (k, v) => { attributes.set(k, String(v)) },
      removeAttribute: (k) => { attributes.delete(k) },
    },
    head: { appendChild: (el) => { appended.push(el); el.isConnected = true } },
    body: element('body'),
    createElement: (tag) => element(tag),
    createDocumentFragment: () => element('fragment'),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: (type, fn) => { listeners.set(type, fn) },
    removeEventListener: (type) => { listeners.delete(type) },
  }
  // cookie 是赋值语义：每次赋值都记一笔（浏览器里同名 cookie 是覆盖，测试只需要看到内容）
  Object.defineProperty(document, 'cookie', {
    get: () => cookieLog.join('; '),
    set: (value) => { cookieLog.push(value) },
    enumerable: true,
  })
  return { document, attributes, appended, listeners, cookieLog }
}

const REACT_STUB = {
  createElement: (type, props, ...children) => ({ type, props, children }),
  Fragment: Symbol('Fragment'),
  useState: () => [undefined, () => {}],
  useRef: () => ({ current: null }),
  useEffect: () => {},
  useCallback: (fn) => fn,
  useMemo: (fn) => fn(),
  useSyncExternalStore: () => undefined,
}

/** 把函数组件的元素展开成宿主元素树（够用的“渲染”：展开函数组件、拍平数组，不碰 hooks）。 */
function render(element) {
  if (element === null || element === undefined || typeof element !== 'object') return element
  if (Array.isArray(element)) return element.map(render)
  if (typeof element.type === 'function') return render(element.type(element.props))
  return { type: element.type, props: element.props, children: (element.children || []).flat(Infinity).map(render) }
}

/** 在 Node 里执行客户端半（ModuleLoader 格式的原样文件），返回 exports 与文档切换器。 */
function loadClient({ primitives, react } = {}) {
  let current = createDom()
  const sandbox = {
    window: { __ModuleLoader__: { load: (reg) => { registration = reg } } },
    console,
    fetch: () => Promise.reject(new Error('offline')),
    MutationObserver: class { observe() {} disconnect() {} },
    ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
    requestAnimationFrame: (fn) => fn(),
    setTimeout: () => 0,
    clearTimeout: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
  }
  Object.defineProperty(sandbox, 'document', { get: () => current.document, enumerable: true })
  sandbox.globalThis = sandbox
  let registration
  vm.runInNewContext(read('lib/client.js'), sandbox, { filename: 'lib/client.js' })
  assert.ok(registration, 'lib/client.js 应当调用 window.__ModuleLoader__.load')
  const exports = registration.factory((spec) => {
    if (spec === 'react') return react === undefined ? REACT_STUB : react
    if (primitives !== undefined && spec === '@deepseek-ai/dsh-client-ui-primitives') return primitives
    throw new Error('unexpected require: ' + spec)
  })
  return {
    exports,
    /**
     * 换一份假 DOM（客户端半闭包里的 document 来自沙箱，必须从沙箱侧切）。
     * options.fontsInstalled 模拟本机装了哪些字体族，用于字体探测的用例。
     */
    useDocument(next, options = {}) {
      const previous = current
      current = next
      const original = next.document.createElement
      const installed = options.fontsInstalled || []
      next.document.createElement = (tag) => {
        if (tag !== 'canvas') return original(tag)
        const ctx = {
          font: '',
          measureText: (text) => {
            const quoted = /"([^"]+)"/.exec(ctx.font)
            const family = quoted === null ? 'monospace' : quoted[1]
            const base = text.length * 10
            // 明确不存在的族名 → 基线；装了候选族 → 宽度不同（familyInstalled 就是这么判的）
            if (family === '__dsh_ux_no_such_family__') return { width: base }
            return { width: installed.includes(family) ? text.length * 7 : base }
          },
        }
        return { getContext: () => ctx }
      }
      return () => { next.document.createElement = original; current = previous }
    },
    styleText() {
      return current.appended.map((el) => el.textContent).join('\n')
    },
  }
}

/** 在给定假 DOM 上跑一段同步逻辑。 */
function withDom(client, dom, options, fn) {
  const restore = client.useDocument(dom, options)
  try {
    return fn()
  } finally {
    restore()
  }
}

const client = loadClient()
const internals = client.exports.__internals

/* -------------------------------------------------------- 1. 客户端半开关机 */

test('客户端半导出 apply/inject，构建号与 package.json 一致', () => {
  assert.equal(typeof client.exports.apply, 'function')
  assert.equal(client.exports.inject.length, 1)
  assert.equal(client.exports.inject[0], 'slots')
  const pkg = JSON.parse(read('package.json'))
  assert.equal(internals.CLIENT_BUILD, pkg.version, 'CLIENT_BUILD 必须随 package.json 一起升版')
  const hostBuild = read('lib/index.js').match(/PKG\.version/)
  assert.ok(hostBuild, '宿主半应从 package.json 读构建号')
})

test('缺省状态：无属性时布尔全开、主题 Solarized、字体 auto、字重半粗、墨色深墨', () => {
  const state = withDom(client, createDom(), {}, () => internals.readStateFromDom())
  for (const key of internals.BOOL_KEYS) assert.equal(state[key], true, key + ' 应默认开')
  assert.equal(state.master, true)
  assert.equal(state.theme, 'solarized-light')
  assert.equal(state.font, 'auto')
  assert.equal(state.fontweight, 'semibold', '默认要落在带「推荐」徽标的半粗')
  assert.equal(state.ink, 'deep', '默认要落在带「推荐」徽标的深墨')
  assert.equal(state.diag, undefined, '诊断日志不再是用户开关')
})

test('状态 → html 属性：布尔是合取，主题/字体/墨色是枚举', () => {
  const dom = createDom()
  withDom(client, dom, {}, () => {
    internals.applyStateToDom({ master: true, theme: 'tokyo-night', font: 'sans-term', fontweight: 'semibold', ink: 'deep', layout: true, fold: true, usage: true, diag: true })
    assert.equal(dom.attributes.get('data-dsh-ux'), 'on')
    assert.equal(dom.attributes.get('data-dsh-ux-theme'), 'tokyo-night')
    assert.equal(dom.attributes.get('data-dsh-ux-theme-tone'), 'dark')
    assert.equal(dom.attributes.get('data-dsh-ux-usage'), 'on')
    assert.equal(dom.attributes.get('data-dsh-ux-font'), 'sans-term')
    assert.equal(dom.attributes.get('data-dsh-ux-fontweight'), 'semibold')
    assert.equal(dom.attributes.get('data-dsh-ux-ink'), 'deep')

    // 总开关关掉：布尔全 off、theme/font 也写 off（两层随之撤下），字重/墨色留原值供恢复
    internals.applyStateToDom({ master: false, theme: 'tokyo-night', font: 'sans-term', fontweight: 'semibold', ink: 'black', layout: true, fold: true, usage: true, diag: true })
    assert.equal(dom.attributes.get('data-dsh-ux'), 'off')
    for (const key of internals.BOOL_KEYS) assert.equal(dom.attributes.get('data-dsh-ux-' + key), 'off', key)
    assert.equal(dom.attributes.get('data-dsh-ux-theme'), 'off')
    assert.equal(dom.attributes.get('data-dsh-ux-theme-tone'), 'auto')
    assert.equal(dom.attributes.get('data-dsh-ux-font'), 'off')
    assert.equal(dom.attributes.get('data-dsh-ux-fontweight'), 'semibold')
    assert.equal(dom.attributes.get('data-dsh-ux-ink'), 'black')

    internals.clearStateFromDom()
    assert.equal(dom.attributes.get('data-dsh-ux'), undefined)
    assert.equal(dom.attributes.get('data-dsh-ux-theme'), undefined)
    assert.equal(dom.attributes.get('data-dsh-ux-theme-tone'), undefined)
    assert.equal(dom.attributes.get('data-dsh-ux-font'), undefined)
    assert.equal(dom.attributes.get('data-dsh-ux-fontweight'), undefined)
    assert.equal(dom.attributes.get('data-dsh-ux-ink'), undefined)

    // 旧属性值 "on"（老宿主半尚未重启）不应被当成合法主题
    internals.applyStateToDom({ master: true, theme: 'on', font: 'auto', fontweight: 'regular', ink: 'theme', layout: true, fold: true, usage: true, diag: true })
    assert.equal(dom.attributes.get('data-dsh-ux-theme'), 'off')
  })
})

test('cookie 往返：枚举/布尔都幂等，越界值与坏 JSON 回落缺省', () => {
  const state = { master: true, theme: false, font: 'sans-mono', fontweight: 'semibold', ink: 'deep', layout: false, fold: true, usage: false, diag: true }
  assert.deepEqual(internals.parseState(internals.serializeState(state)), internals.normalizeState(state))
  assert.deepEqual(internals.parseState('not-json'), null)
  assert.deepEqual(internals.parseState(''), null)
  assert.deepEqual(internals.parseState(encodeURIComponent(JSON.stringify({ theme: 'yes', ghost: 1 }))), internals.DEFAULT_STATE)
})

test('归一化：越界的主题/字体/字重/墨色被丢弃；旧版布尔 theme/font 映射回默认/off', () => {
  const n = internals.normalizeState
  assert.equal(n({ font: 'comic-sans' }).font, 'auto', '越界方案回落 auto')
  assert.equal(n({ font: 'off' }).font, 'off')
  assert.equal(n({ font: true }).font, 'auto', '旧版 font=true → auto')
  assert.equal(n({ font: false }).font, 'off', '旧版 font=false → off')
  assert.equal(n({ fontweight: 'black' }).fontweight, 'semibold')
  assert.equal(n({ fontweight: 'semibold' }).fontweight, 'semibold')
  assert.equal(n({ ink: 'neon' }).ink, 'deep', '越界墨色回落默认（深墨）')
  assert.equal(n({ ink: 'black' }).ink, 'black')
  assert.equal(n({ theme: 'neon' }).theme, 'solarized-light', '越界主题回落默认')
  assert.equal(n({ theme: true }).theme, 'solarized-light', '旧版 theme=true → 默认主题')
  assert.equal(n({ theme: false }).theme, 'off', '旧版 theme=false → 官方配色')
  assert.equal(n({ theme: 'kanagawa-wave' }).theme, 'kanagawa-wave')
  assert.equal(n(null).font, 'auto')
})

test('v1→v2 一次性迁移：旧默认（跟随配色 + 标准）抬到推荐档，写完 rev 后不再改写', () => {
  const n = internals.normalizeState
  const legacy = n({ master: true, theme: 'solarized-light', fontweight: 'regular', ink: 'theme' })
  assert.equal(legacy.fontweight, 'semibold', '旧默认字重要抬到半粗')
  assert.equal(legacy.ink, 'deep', '旧默认墨色要抬到深墨')
  assert.equal(legacy.rev, 2)

  const migrated = n({ rev: 2, fontweight: 'regular', ink: 'theme' })
  assert.equal(migrated.fontweight, 'regular', 'rev=2 后显式选择标准要保留')
  assert.equal(migrated.ink, 'theme', 'rev=2 后显式选择跟随配色要保留')

  const partial = n({ rev: 2, ink: 'black' })
  assert.equal(partial.ink, 'black')
  assert.equal(partial.fontweight, 'semibold', '没写的键仍取推荐默认')
})

test('初始状态以 cookie 为准：总开关关过一轮，分项选择不能在重载后丢失', () => {
  const raw = { master: false, theme: false, font: 'sans-term', fontweight: 'semibold', layout: false, fold: true, usage: false, diag: true }
  const dom = createDom()
  // 属性里只有合取（总开关关着 → 布尔全 off、font 写 off），cookie 里才是原始选择
  dom.document.cookie = 'dsh-enhance-config=' + internals.serializeState(raw)
  for (const key of internals.BOOL_KEYS) dom.document.documentElement.setAttribute('data-dsh-ux-' + key, 'off')
  dom.document.documentElement.setAttribute('data-dsh-ux', 'off')
  dom.document.documentElement.setAttribute('data-dsh-ux-font', 'off')

  const restored = withDom(client, dom, {}, () => internals.initialState())
  assert.deepEqual(restored, internals.normalizeState(raw), '总开关、分项与字体方案都要按 cookie 还原')

  // 没有 cookie 时退回属性（旧版 host 脚本只写 data-dsh-ux-theme 的场景）
  const legacyDom = createDom()
  legacyDom.document.documentElement.setAttribute('data-dsh-ux-theme', 'off')
  const legacy = withDom(client, legacyDom, {}, () => internals.initialState())
  assert.equal(legacy.theme, 'off')
  assert.equal(legacy.master, true)
  assert.equal(legacy.fold, true)
})

test('store.set 同时改写 html 属性和 cookie（即时开关的两条腿）', () => {
  const dom = createDom()
  withDom(client, dom, {}, () => {
    const store = internals.createStore({ ...internals.DEFAULT_STATE })
    let notified = 0
    const off = store.subscribe(() => { notified += 1 })

    store.set('theme', 'off')
    assert.equal(dom.attributes.get('data-dsh-ux-theme'), 'off')
    assert.ok(dom.cookieLog.some((entry) => entry.startsWith('dsh-enhance-config=')), '应写入配置 cookie')
    assert.ok(dom.cookieLog.some((entry) => entry.startsWith('dsh-enhance-theme=;')), '应清掉旧版 cookie')
    assert.equal(store.get().theme, 'off')
    assert.equal(notified, 1, '一次 set 只通知一次')

    // 主题是枚举：切换立即改属性与 tone
    store.set('theme', 'kanagawa-wave')
    assert.equal(dom.attributes.get('data-dsh-ux-theme'), 'kanagawa-wave')
    assert.equal(dom.attributes.get('data-dsh-ux-theme-tone'), 'dark')
    assert.equal(store.get().theme, 'kanagawa-wave')

    // 字体方案是枚举：set 立刻改属性，且 fontEnabled() 跟着变
    store.set('font', 'sans-mono')
    assert.equal(dom.attributes.get('data-dsh-ux-font'), 'sans-mono')
    assert.equal(store.fontEnabled(), true)
    store.set('font', 'off')
    assert.equal(store.fontEnabled(), false)
    assert.equal(store.get().font, 'off', '枚举原值保留，关掉字体层也能一键开回来')

    // 总开关关掉后分项不再生效，但分项自己的选择要保留
    store.set('master', false)
    assert.equal(dom.attributes.get('data-dsh-ux-usage'), 'off')
    assert.equal(dom.attributes.get('data-dsh-ux-font'), 'off')
    assert.equal(store.effective('usage'), false)
    assert.equal(store.get().usage, true)

    // 同一个值重复写不再通知
    store.set('master', false)
    assert.equal(notified, 5)

    store.setAll()
    assert.equal(store.get().theme, 'solarized-light')
    assert.equal(store.get().font, 'auto', '恢复默认要把字体方案也带回 auto')
    assert.equal(dom.attributes.get('data-dsh-ux'), 'on')
    assert.equal(dom.attributes.get('data-dsh-ux-font'), 'auto')
    assert.equal(notified, 6)

    off()
    store.set('diag', false)
    assert.equal(notified, 6, '取消订阅后不再收到通知')
  })
})

/* ------------------------------------------------------------ 2. CSS 闸门 */

/** 跑一次 apply()，收集注入到 <style> 的 CSS 文本。 */
function collectStyleText(options = {}) {
  const dom = createDom()
  return withDom(client, dom, options, () => {
    client.exports.apply({ get: () => undefined, effect: () => {}, on: () => {} })
    return client.styleText()
  })
}

test('CSS：每个布尔功能块都挂在闸门上，且闸门键与 BOOL_KEYS 一一对应', () => {
  const styles = collectStyleText()
  for (const key of internals.BOOL_KEYS) {
    assert.ok(styles.includes('html[data-dsh-ux-' + key + '="on"]'), '缺少闸门: ' + key)
  }
  // 旧的无闸门选择器不许残留
  assert.ok(!/^\s*\* \{/m.test(styles), '仍有未加闸门的全局 * 规则')
  assert.ok(!/^\s*html, body \{/m.test(styles), '仍有未加闸门的 html, body 规则')
  assert.ok(!/^\s*\[data-chat-flow\] >/m.test(styles), '仍有未加闸门的折叠规则')
  assert.ok(styles.includes('html[data-dsh-ux-fold="on"] [data-chat-flow]:not([data-step-process-content]) > [data-chat-flow-kind="tool-call"]'), '折叠闸门必须收窄到 0.1.x 扁平流，不碰官方过程分组')
  assert.ok(styles.includes('html[data-dsh-ux="on"][data-dsh-ux-theme="solarized-light"] body'))
  assert.ok(styles.includes('html[data-dsh-ux-layout="on"] [data-content-phase="hero"] [data-composer-card]'))
  assert.ok(styles.includes('html[data-dsh-ux-usage="on"] [data-slot="conversation.composer.dock"]'))
})

test('CSS：每套非官方主题都有 token 块与 tone，官方配色不写覆盖', () => {
  const styles = collectStyleText()
  for (const theme of internals.THEMES) {
    if (theme.key === 'off') continue
    assert.ok(
      styles.includes('html[data-dsh-ux="on"][data-dsh-ux-theme="' + theme.key + '"] body'),
      '缺少主题块: ' + theme.key,
    )
    assert.ok(
      styles.includes('html[data-dsh-ux="on"][data-dsh-ux-theme="' + theme.key + '"] { color-scheme: ' + theme.tone + '; }'),
      '缺少 color-scheme: ' + theme.key,
    )
  }
  assert.ok(!styles.includes('data-dsh-ux-theme="off"]'), '官方配色不应留下任何覆盖规则')
  assert.equal((styles.match(/\{/g) || []).length, (styles.match(/\}/g) || []).length, '生成的 CSS 花括号必须配对')
  // 生成的主题必须覆盖五级文字与关键 surface token
  for (const token of ['--dsw-alias-bg-base', '--dsw-alias-label-primary', '--dsw-alias-label-tertiary', '--dsw-alias-brand-primary']) {
    assert.ok(styles.includes(token), '主题 CSS 缺少 token: ' + token)
  }
})

test('配色主题：正文在底色与 layer-1 上达到 AA（Solarized 沿用既有观感，由墨色档位兜底）', () => {
  const rgb = (hex) => {
    const n = parseInt(hex.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const lum = (hex) => {
    const [r, g, b] = rgb(hex).map((v) => {
      const s = v / 255
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const contrast = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
    return (hi + 0.05) / (lo + 0.05)
  }
  const bad = []
  for (const theme of internals.THEMES) {
    if (theme.key === 'off' || theme.key === 'solarized-light') continue
    const t = internals.themeTokens(theme)
    const bg = t['--dsw-alias-bg-base']
    const bg1 = t['--dsw-alias-bg-layer-1']
    const fg = t['--dsw-alias-label-primary']
    const c1 = contrast(fg, bg)
    const c2 = contrast(fg, bg1)
    if (c1 < 4.5 || c2 < 4.5) bad.push(theme.key + ' bg=' + c1.toFixed(2) + ' bg1=' + c2.toFixed(2))
  }
  assert.deepEqual(bad, [], '以下主题正文对比度不达标: ' + bad.join('; '))
})

test('主题命名统一为「English · 中文」', () => {
  for (const theme of internals.THEMES) {
    assert.ok(
      /^[^\u4e00-\u9fa5]+ · [\u4e00-\u9fa5]/.test(theme.label),
      theme.key + ' 命名不符合 English · 中文：' + theme.label,
    )
  }
  assert.equal(internals.FONT_SCHEMES.find((s) => s.key === 'off').label, '关闭', '字体方案的 off 不能被主题命名影响')
})

test('CSS：墨色三档只作用于浅色，五级文字 token 全覆盖，且不碰按钮反白字', () => {
  const styles = collectStyleText()
  for (const key of ['deep', 'black']) {
    const match = styles.match(new RegExp('html\\[data-dsh-ux="on"\\]\\[data-dsh-ux-ink="' + key + '"\\][^{]*\\{[^}]*\\}'))
    assert.ok(match, '缺少墨色闸门: ' + key)
    for (const token of ['label-primary', 'label-secondary', 'label-tertiary', 'label-caption', 'label-dimmed']) {
      assert.ok(match[0].includes('--dsw-alias-' + token), key + ' 缺少文字 token: ' + token)
    }
    assert.ok(match[0].includes(':not([data-ds-dark-theme])'), key + ' 必须只作用于浅色')
    assert.ok(!match[0].includes('primary-foreground'), key + ' 不得覆盖按钮上的反白字')
  }
  assert.ok(!styles.includes('[data-dsh-ux-ink="theme"]'), '跟随配色不应写任何覆盖规则')
})

test('折叠契约探测：0.1.x 走旧路径；0.2.0 过程分组走新路径；失配时自禁用并给提示', () => {
  const makeDoc = ({ content, groups, rows }) => ({
    querySelector: (sel) => (sel === '[data-step-process-content]' && content ? {} : null),
    querySelectorAll: (sel) => {
      if (sel === '[data-chat-group-key]') return new Array(groups).fill({})
      if (sel === '[data-chat-flow-kind="turn-process"]') return new Array(rows).fill({})
      return []
    },
  })
  const legacy = internals.detectFoldContract(makeDoc({ content: false, groups: 0, rows: 0 }))
  assert.equal(legacy.mode, 'legacy')
  assert.equal(legacy.supported, true)
  assert.equal(internals.foldContractNote(makeDoc({ content: false, groups: 0, rows: 0 })), undefined, '0.1.x 无需额外提示')

  const groupsOnly = internals.detectFoldContract(makeDoc({ content: true, groups: 2, rows: 0 }))
  assert.equal(groupsOnly.mode, 'process-groups')
  assert.equal(groupsOnly.supported, true)

  const rowsOnly = internals.detectFoldContract(makeDoc({ content: true, groups: 0, rows: 3 }))
  assert.equal(rowsOnly.mode, 'process-groups')
  assert.equal(rowsOnly.supported, true)
  assert.match(internals.foldContractNote(makeDoc({ content: true, groups: 2, rows: 0 })), /已完成，用时/, '0.2.0 要在设置页说明新挂载落点')

  const mismatch = internals.detectFoldContract(makeDoc({ content: true, groups: 0, rows: 0 }))
  assert.equal(mismatch.mode, 'process-groups')
  assert.equal(mismatch.supported, false, '有过程容器却没有任何聚合行/分组根时应自禁用，而不是静默生成不可见节点')
  assert.match(mismatch.reason, /自禁用/)
})

/* -------------------------------------------------- 2b. 字体层（中文优先/0.5） */

test('CSS：每个字体方案都有自己的家族栈；未选方案时落到默认（自动）栈', () => {
  const styles = collectStyleText()
  for (const [key, stack] of Object.entries(internals.FONT_STACKS)) {
    assert.ok(styles.includes(stack), '缺少家族栈: ' + key)
    if (key === 'auto') continue
    assert.ok(styles.includes('html[data-dsh-ux-font="' + key + '"] body'), '缺少方案选择器: ' + key)
  }
  // 默认栈挂在 :not([...="off"]) 上：旧宿主半写的 "on" 或任何未知取值都会落到自动栈，
  // 而不是让 --dshx-font-family 悬空、把整条字体声明变成 invalid
  assert.ok(styles.includes('html:not([data-dsh-ux-font="off"]) body'))
  assert.ok(styles.includes('--dshx-font-family:'), '家族栈应当写进变量')
  // 每个方案都必须给出 0.5 窄体西文（Iosevka / Noto Mono CJK），不许混进比例西文
  for (const scheme of internals.FONT_SCHEMES) {
    if (scheme.key === 'off') continue
    assert.ok(scheme.families.length > 0, scheme.key + ' 应当有候选族')
  }
})

test('CSS：令牌全部走字重变量，且关掉了合成加粗（文章 §3.1）', () => {
  const styles = collectStyleText()
  assert.ok(styles.includes('font-synthesis: none'), '必须关掉合成加粗/斜体')
  assert.ok(styles.includes('--dshx-w-a: 400;') && styles.includes('--dshx-w-c: 600;'), '标准字重四档')
  assert.ok(styles.includes('--dshx-w-a: 600;') && styles.includes('--dshx-w-b: 700;'), '半粗字重四档')
  // 官方那套令牌一个都不能漏：漏了就会掉回官方字体（族名不同 → 中西文混排不一致）
  for (const token of ['--dsw-font-family', '--ds-font-family-code', '--dsw-font-base-16', '--dsw-font-base-strong-16', '--dsw-font-markdown-base', '--dsw-font-markdown-base-strong', '--dsw-font-markdown-code', '--dsw-font-markdown-code-block', '--dsw-font-xl-24']) {
    assert.ok(styles.includes(token + ':'), '缺少令牌接管: ' + token)
  }
  assert.ok(!/--dsw-font-base-16: 15px\/21px/.test(styles), '正文令牌必须带字重变量，不再写死')
})

test('字体探测：装了才判存在；同名族不同字重也要认（用不存在的族名当基线）', () => {
  const installed = ['Sarasa Term SC', 'Maple Mono NF CN']
  const probe = (family) => withDom(client, createDom(), { fontsInstalled: installed }, () => internals.familyInstalled(family))
  assert.equal(probe('Sarasa Term SC'), true)
  assert.equal(probe('Maple Mono NF CN'), true)
  assert.equal(probe('Sarasa Mono SC'), false)
  assert.equal(probe('Maple Mono'), false)
  assert.equal(probe('Sarasa Gothic SC'), false)
})

test('方案可用性：off 永远可用；其余按候选族或语义判定', () => {
  const schemes = Object.fromEntries(internals.FONT_SCHEMES.map((s) => [s.key, s]))
  const run = (installed) => withDom(client, createDom(), { fontsInstalled: installed }, () => internals.detectSchemes())
  const none = run([])
  assert.equal(none.off, true, '关闭永远可用')
  assert.equal(none['sans-mono'], false)
  assert.equal(none.noto, false)
  assert.equal(none.auto, false, '一款都没装时 auto 没有可选项')

  const sarasaOnly = run(['Sarasa Term SC'])
  assert.equal(sarasaOnly['sans-term'], true)
  assert.equal(sarasaOnly.auto, true, 'auto 命中任一候选即算可用')
  assert.equal(sarasaOnly['sans-mono'], false)
  assert.equal(schemes['sans-term'].families[0], 'Sarasa Term SC')
})

test('对齐自检块：40 个半角列 = 20 个汉字；方框是严丝合缝的矩形', () => {
  // 简化的东亚宽度：CJK 汉字区按 2 列算，其余（含制表符 U+2500 段）按 1 列算
  const wide = (ch) => {
    const cp = ch.codePointAt(0)
    return (cp >= 0x2e80 && cp <= 0x9fff) || (cp >= 0xf900 && cp <= 0xfaff) || (cp >= 0xff00 && cp <= 0xff60)
  }
  const columns = (line) => [...line].reduce((n, ch) => n + (wide(ch) ? 2 : 1), 0)
  const lines = internals.ALIGN_SAMPLE.split('\n')
  assert.equal(lines.length, 6)

  assert.equal(lines[0].length, 40, '第 1 行是 40 个半角字符的标尺')
  assert.equal(lines[1].length, 20, '第 2 行是 20 个汉字')
  assert.equal(columns(lines[0]), 40)
  assert.equal(columns(lines[1]), 40, '20 个汉字必须正好 40 列 —— 这就是 2:1')

  assert.equal(lines[2].length, 20, '第 3 行是 20 个歧义字符（Mono 下 40 列、Term 下 20 列）')
  assert.ok(lines[2].includes('\u2014\u2014') && lines[2].includes('\u2026\u2026'), '必须是中文破折号 U+2014 与省略号 U+2026')

  assert.ok(lines[3].startsWith('┌') && lines[3].endsWith('┐'))
  assert.ok(lines[4].startsWith('│') && lines[4].endsWith('│'))
  assert.ok(lines[5].startsWith('└') && lines[5].endsWith('┘'))
  assert.equal(columns(lines[3]), columns(lines[4]), '方框上下必须等宽')
  assert.equal(columns(lines[4]), columns(lines[5]), '方框上下必须等宽')

  const element = internals.AlignSample()
  assert.ok(element.props.className.includes('dshx-grid'))
  assert.equal(element.children[0], internals.ALIGN_SAMPLE)
})

test('字体方案行：六个方案各一枚胶囊；未安装的禁用并标注；当前项高亮；自检块只在字体层开着时渲染', () => {
  const detected = {
    available: { off: true, auto: true, 'sans-mono': true, 'sans-term': false, noto: false, maple: true },
    autoPick: 'Sarasa Mono SC',
  }
  const state = { ...internals.DEFAULT_STATE, font: 'sans-mono' }
  const row = render(internals.FontSchemeRow({ state: state, detected: detected, disabled: false }))
  const pills = row.children[1]
  assert.ok(pills.props.className.includes('dshx-pills'))
  assert.equal(pills.children.length, internals.FONT_SCHEMES.length, '每个方案一枚胶囊（含关闭）')

  const find = (label) => pills.children.find((pill) => JSON.stringify(pill.children[0].children) === JSON.stringify([label]))
  const mono = find('Sarasa Mono SC')
  assert.ok(mono.props.className.includes('dshx-pill-on'), '当前方案要高亮')
  assert.equal(mono.props['aria-pressed'], true)
  assert.equal(mono.props.disabled, false)

  const term = find('Sarasa Term SC')
  assert.equal(term.props.disabled, true, '本机没装的方案要禁用')
  assert.equal(term.children[1].children[0], '未安装')

  assert.equal(find('自动（推荐）').children[1].children[0], 'Sarasa Mono SC', '自动要标注会选哪一款')
  assert.equal(find('关闭').props.disabled, false, '关闭永远可选')

  // 自检块：字体层开着时附在行尾
  assert.equal(row.children[3].props.className, 'dshx-grid')
  const off = internals.FontSchemeRow({ state: { ...state, font: 'off' }, detected: detected, disabled: false })
  assert.equal(off.children[3], undefined, '关掉字体层就不显示对齐自检块')
})

test('设置页整页能构建：Star 入口 → 总开关 → 外观(配色 / 字体方案 / 墨色 / 字重) → 布局 → 数据 → 页脚', () => {
  // 钩子要返回真值，否则 useSyncExternalStore 给出 undefined 会在取 state.master 时炸掉
  const hooksReact = {
    ...REACT_STUB,
    useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
    useRef: (initial) => ({ current: initial === undefined ? null : initial }),
    useMemo: (fn) => fn(),
    useCallback: (fn) => fn,
    useEffect: () => {},
    useSyncExternalStore: () => ({ ...internals.DEFAULT_STATE }),
  }
  const page = loadClient({ react: hooksReact })
  const dom = createDom()
  const tree = withDom(page, dom, {}, () => render(page.exports.__internals.SettingsPage({})))
  assert.equal(tree.props.className, 'dshx-page')

  const cls = (node) => (node && node.props && node.props.className) || ''
  const children = tree.children
  assert.ok(cls(children[0]).includes('dshx-star'), '最上面是 GitHub Star 入口')
  assert.equal(cls(children[0].children[1]), 'dshx-star-text')
  const starLink = children[0].children[2]
  assert.equal(starLink.props.href, 'https://github.com/jiangnanquan/dsh-ux', 'Star 按钮要指向仓库')
  assert.equal(starLink.props.target, '_blank', 'Star 按钮在新窗口打开')
  assert.ok(String(starLink.props.rel).includes('noopener'), '新窗口链接要带 noopener')
  assert.equal(cls(children[1].children[0]), 'dshx-banner', '第二块是宿主半状态横幅')
  assert.ok(cls(children[2]).includes('dshx-row'), '第三块是总开关行')
  assert.equal(cls(children[3]), 'dshx-group')
  assert.equal(children[3].children[0], '外观')
  assert.ok(cls(children[4]).includes('dshx-choice'), '外观里先是配色主题行')
  assert.ok(cls(children[5]).includes('dshx-choice'), '紧跟着字体方案行')
  assert.ok(cls(children[6]).includes('dshx-choice'), '再是文字墨色行')
  assert.ok(cls(children[7]).includes('dshx-choice'), '最后是字重行')
  assert.equal(children[8].children[0], '布局')
  assert.equal(children[11].children[0], '数据')
  assert.equal(cls(children[children.length - 1]), 'dshx-foot', '末尾是版本与恢复默认')
  assert.equal(children.length, 14, '结构变了就更新这条断言，别让它悄悄漂移')

  // 主题行：下拉按谱系分组，选项数 = 全部主题
  const themeRow = render(children[4])
  const select = themeRow.children[0].children[2].children[0]
  assert.equal(select.type, 'select')
  assert.equal(select.props.value, 'solarized-light')
  assert.equal(select.children.length, internals.THEME_GROUPS.length, 'optgroup 数 = 主题分组数')
  const optionCount = select.children.reduce((sum, group) => sum + group.children.length, 0)
  assert.equal(optionCount, internals.THEMES.length, '选项数 = 全部主题（含官方配色）')
  assert.equal(themeRow.children[0].children[2].children[1].children.length, 3, '当前主题要显示底/字/强调三色预览')

  // 字体方案行里必须能点出六个方案
  const schemePills = render(children[5]).children[1]
  assert.equal(schemePills.children.length, internals.FONT_SCHEMES.length)
  // 墨色行里必须能点出三档
  const inkPills = render(children[6]).children[1]
  assert.equal(inkPills.children.length, internals.INK_SCHEMES.length)
})

/* ------------------------------------------------------ 3. 注册进哪几个插槽 */
/** 跑一次 apply()，记录它往哪些插槽注册了什么。 */
function applyAndCollectRegistrations() {
  const dom = createDom()
  return withDom(client, dom, {}, () => {
    const registrations = []
    const slots = {
      inject: (key, callback) => { callback(); return () => {} },
      register: (options, component) => { registrations.push({ slot: options.name, options, component }); return () => {} },
    }
    client.exports.apply({
      get: (name) => (name === 'slots' ? slots : undefined),
      effect: () => {},
      on: () => {},
    })
    return registrations
  })
}

test('插槽：整插件一个 settings.section，且不再占用 settings.general.item', () => {
  const registrations = applyAndCollectRegistrations()
  assert.deepEqual(registrations.map((r) => r.slot).sort(), [
    'conversation.composer.dock',
    'settings.section',
    'shell.overlay',
    'shell.overlay',
  ])
  const section = registrations.find((r) => r.slot === 'settings.section')
  assert.equal(section.options.id, 'dsh-enhance')
  assert.equal(section.options.label, '界面增强')
  assert.equal(typeof section.component, 'function')
  assert.ok(!registrations.some((r) => r.slot === 'settings.general.item'), '配色行已迁出「通用设置」')
})

test('开关控件：平台种子提供官方 Switch 时用它，缺席时退回同度量的自带实现', () => {
  const OfficialSwitchStub = function OfficialSwitch() {}
  const withSeed = loadClient({ primitives: { Switch: OfficialSwitchStub } })
  const fromSeed = withSeed.exports.__internals.SwitchCell({ checked: true, disabled: false, label: 'L', onChange: () => {} })
  assert.equal(fromSeed.type, OfficialSwitchStub, '应使用官方 Switch 组件')
  assert.equal(fromSeed.props.checked, true)
  assert.equal(fromSeed.props.label, 'L')

  const withoutSeed = internals.SwitchCell({ checked: false, disabled: true, label: 'L', onChange: () => {} })
  assert.equal(withoutSeed.type, 'button', '没有种子时用自带 button[role=switch]')
  assert.equal(withoutSeed.props.role, 'switch')
  assert.equal(withoutSeed.props['aria-checked'], false)
  assert.equal(withoutSeed.props.disabled, true)
  assert.equal(withoutSeed.children[0].props.className, 'dshx-switch-thumb')
})

test('宿主半探测：200+JSON 算同步；404 / 200+HTML / 缺 build 都算「需重启」', async () => {
  const respond = (status, text) => () => Promise.resolve({ ok: status >= 200 && status < 300, status, text: () => Promise.resolve(text) })

  const ok = await internals.probeHost(respond(200, JSON.stringify({ ok: true, build: '1.2.0' })))
  assert.equal(ok.phase, 'ok')
  assert.equal(ok.build, '1.2.0')

  const notFound = await internals.probeHost(respond(404, ''))
  assert.equal(notFound.phase, 'missing')
  assert.match(notFound.message, /HTTP 404/)

  const html = await internals.probeHost(respond(200, '<!doctype html><html></html>'))
  assert.equal(html.phase, 'missing')
  assert.match(html.message, /不是 JSON/)

  const oldHalf = await internals.probeHost(respond(200, JSON.stringify({ ok: true })))
  assert.equal(oldHalf.phase, 'missing')
  assert.match(oldHalf.message, /build/)
})

/* ------------------------------------------------------------- 4. 宿主半 */

const host = await import(new URL('lib/index.js', root))
const hostSource = read('lib/index.js')

/** apply 宿主半，返回它注册的路由与首帧注入行。 */
function applyHost() {
  const routes = []
  const handlers = []
  host.apply({
    get: () => undefined,
    reflect: { get: (name) => (name === 'webServer' ? { register: (route) => routes.push(route) } : undefined) },
    on: (event, handler) => { if (event === 'webserver/index-inject') handlers.push(handler) },
  })
  const table = []
  for (const handler of handlers) handler(table)
  return { routes, table }
}

test('宿主半：注册 4 条路由，含 /enh/ping，且构建号取自 package.json', () => {
  const { routes, table } = applyHost()
  assert.deepEqual(routes.map((r) => r.path).sort(), ['/enh/balance', '/enh/ping', '/enh/session-usage', '/enh/usage'])
  assert.ok(routes.every((r) => r.kind === 'exact'))
  assert.equal(table.length, 1)
  assert.equal(table[0].kind, 'script')
  assert.equal(table[0].placement, 'body')

  let body = null
  routes.find((r) => r.path === '/enh/ping').handler(
    { url: '/enh/ping' },
    { setHeader() {}, end: (text) => { body = JSON.parse(text) } },
  )
  assert.equal(body.ok, true)
  assert.equal(body.build, JSON.parse(read('package.json')).version)
})

/** 在同一份状态上跑首帧脚本，返回它写下的属性表。 */
function runFirstPaintScript(script, cookie) {
  const attributes = new Map()
  const sandbox = {
    document: {
      cookie,
      documentElement: { setAttribute: (k, v) => attributes.set(k, String(v)) },
    },
  }
  sandbox.globalThis = sandbox
  vm.runInNewContext(script, sandbox, { filename: 'first-paint.js' })
  return attributes
}

test('首帧脚本：cookie 缺失 → 布尔全开 + Solarized + 字体 auto + 墨色 theme；关掉的项原样恢复；旧版 cookie 仍认', () => {
  const script = applyHost().table[0].text
  const fresh = runFirstPaintScript(script, '')
  assert.equal(fresh.get('data-dsh-ux'), 'on')
  for (const key of internals.BOOL_KEYS) assert.equal(fresh.get('data-dsh-ux-' + key), 'on', key)
  assert.equal(fresh.get('data-dsh-ux-theme'), 'solarized-light', '主题必须首帧前定好，否则会先按官方配色画一帧')
  assert.equal(fresh.get('data-dsh-ux-theme-tone'), 'light')
  assert.equal(fresh.get('data-dsh-ux-font'), 'auto', '字体方案必须在首帧前定好，否则会先按官方字体画一帧')
  assert.equal(fresh.get('data-dsh-ux-fontweight'), 'semibold')
  assert.equal(fresh.get('data-dsh-ux-ink'), 'deep', '墨色默认落在推荐档（深墨）')

  const stored = { master: true, theme: 'kanagawa-wave', font: 'sans-term', fontweight: 'semibold', ink: 'deep', layout: false, fold: true, usage: false, diag: true }
  const restored = runFirstPaintScript(script, 'dsh-enhance-config=' + internals.serializeState(stored))
  assert.equal(restored.get('data-dsh-ux-theme'), 'kanagawa-wave')
  assert.equal(restored.get('data-dsh-ux-theme-tone'), 'dark')
  assert.equal(restored.get('data-dsh-ux-layout'), 'off')
  assert.equal(restored.get('data-dsh-ux-usage'), 'off')
  assert.equal(restored.get('data-dsh-ux-fold'), 'on')
  assert.equal(restored.get('data-dsh-ux-font'), 'sans-term')
  assert.equal(restored.get('data-dsh-ux-fontweight'), 'semibold')
  assert.equal(restored.get('data-dsh-ux-ink'), 'deep')

  const masterOff = runFirstPaintScript(script, 'dsh-enhance-config=' + internals.serializeState({ ...stored, master: false }))
  assert.equal(masterOff.get('data-dsh-ux'), 'off')
  for (const key of internals.BOOL_KEYS) assert.equal(masterOff.get('data-dsh-ux-' + key), 'off', key)
  assert.equal(masterOff.get('data-dsh-ux-theme'), 'off')
  assert.equal(masterOff.get('data-dsh-ux-theme-tone'), 'auto')
  assert.equal(masterOff.get('data-dsh-ux-font'), 'off')
  assert.equal(masterOff.get('data-dsh-ux-ink'), 'deep', '总开关关掉时墨色选择要保留，下次打开原样恢复')

  const legacy = runFirstPaintScript(script, 'dsh-enhance-theme=off')
  assert.equal(legacy.get('data-dsh-ux-theme'), 'off')
  assert.equal(legacy.get('data-dsh-ux-fold'), 'on')
})

test('首帧脚本：主题白名单——越界值回落默认，旧版布尔 theme 映射回默认/off', () => {
  const script = applyHost().table[0].text
  const rawTheme = (value) => {
    const json = encodeURIComponent(JSON.stringify({ master: true, theme: value }))
    return runFirstPaintScript(script, 'dsh-enhance-config=' + json)
  }
  const bogus = rawTheme('neon')
  assert.equal(bogus.get('data-dsh-ux-theme'), 'solarized-light', '越界主题回落默认')
  assert.equal(bogus.get('data-dsh-ux-theme-tone'), 'light')
  const legacyTrue = rawTheme(true)
  assert.equal(legacyTrue.get('data-dsh-ux-theme'), 'solarized-light', '旧版 theme=true → 默认主题')
  const legacyFalse = rawTheme(false)
  assert.equal(legacyFalse.get('data-dsh-ux-theme'), 'off', '旧版 theme=false → 官方配色')
  assert.equal(legacyFalse.get('data-dsh-ux-theme-tone'), 'auto')
  const dark = rawTheme('gemini-dark')
  assert.equal(dark.get('data-dsh-ux-theme'), 'gemini-dark')
  assert.equal(dark.get('data-dsh-ux-theme-tone'), 'dark')
})

test('首帧脚本：字体方案白名单——越界值回落默认，旧版布尔 font 映射回 auto/off', () => {
  const script = applyHost().table[0].text
  const withFont = (font) => runFirstPaintScript(script, 'dsh-enhance-config=' + internals.serializeState({ font: font })).get('data-dsh-ux-font')
  // 手工构造 cookie，绕过 normalizeState 的校验（模拟被改坏/未来版本写入的值）
  const rawFont = (value) => {
    const json = encodeURIComponent(JSON.stringify({ master: true, font: value }))
    return runFirstPaintScript(script, 'dsh-enhance-config=' + json).get('data-dsh-ux-font')
  }
  assert.equal(rawFont('comic-sans'), 'auto', '越界方案回落 auto')
  assert.equal(rawFont('sans-mono'), 'sans-mono')
  assert.equal(rawFont(123), 'auto')
  assert.equal(rawFont(true), 'auto', '旧版 font=true → auto')
  assert.equal(rawFont(false), 'off', '旧版 font=false → off')
})

test('首帧脚本与客户端半的属性口径一致（同名同值）', () => {
  const script = applyHost().table[0].text
  const state = { master: true, theme: 'rose-pine-dawn', font: 'maple', fontweight: 'semibold', ink: 'deep', layout: true, fold: true, usage: false, diag: true }
  const fromScript = runFirstPaintScript(script, 'dsh-enhance-config=' + internals.serializeState(state))
  const dom = createDom()
  withDom(client, dom, {}, () => internals.applyStateToDom(state))
  for (const [key, value] of fromScript) assert.equal(dom.attributes.get(key), value, key)
  assert.equal(fromScript.size, dom.attributes.size, '两边写入的属性集合必须完全相同')
})

test('枚举白名单：宿主半与客户端半的主题/字体/字重/墨色集合一致', () => {
  const hostEnums = read('lib/index.js')
  for (const key of internals.THEME_KEYS) assert.ok(hostEnums.includes(`'${key}'`), '宿主半白名单缺少主题: ' + key)
  for (const key of internals.FONT_SCHEME_KEYS) assert.ok(hostEnums.includes(`'${key}'`), '宿主半白名单缺少方案: ' + key)
  for (const key of internals.FONT_WEIGHT_KEYS) assert.ok(hostEnums.includes(`'${key}'`), '宿主半白名单缺少字重: ' + key)
  for (const key of internals.INK_SCHEME_KEYS) assert.ok(hostEnums.includes(`'${key}'`), '宿主半白名单缺少墨色: ' + key)
  assert.deepEqual([...internals.ENUM_KEYS.theme].sort(), [...internals.THEME_KEYS].sort())
  assert.deepEqual(
    [...internals.ENUM_KEYS.font].sort(),
    ['auto', 'maple', 'noto', 'off', 'sans-mono', 'sans-term'],
  )
  assert.deepEqual([...internals.ENUM_KEYS.ink].sort(), ['black', 'deep', 'theme'])
})

test('峰谷计费：北京时间 9-12 / 14-18 为峰，其余为谷；跨天回到次日 9:00', () => {
  const at = (h, m) => Date.UTC(2026, 9, 17, h - 8, m, 0)
  const peak = internals.pricingClock(at(10, 0))
  assert.equal(peak.peak, true)
  assert.equal(peak.minutes, 120, '10:00 距 12:00 还有 2 小时')
  assert.equal(peak.nextPeak, false)

  const valley = internals.pricingClock(at(13, 30))
  assert.equal(valley.peak, false)
  assert.equal(valley.minutes, 30, '13:30 距 14:00 还有 30 分钟')
  assert.equal(valley.nextPeak, true)

  const edge = internals.pricingClock(at(11, 59))
  assert.equal(edge.peak, true)
  assert.equal(edge.minutes, 1)

  const evening = internals.pricingClock(at(18, 0))
  assert.equal(evening.peak, false)
  assert.equal(evening.minutes, 15 * 60, '18:00 之后的下一个边界是次日 9:00')
  assert.equal(evening.nextPeak, true)

  assert.equal(internals.fmtGap(120), '2 小时')
  assert.equal(internals.fmtGap(90), '1 小时 30 分')
  assert.equal(internals.fmtGap(5), '5 分钟')
  assert.ok(internals.pricingHint(peak).includes('峰时计费'))
  assert.ok(internals.pricingHint(evening).includes('空闲半价'))
  assert.equal(internals.isOfficialProvider('deepseek-official'), true)
  assert.equal(internals.isOfficialProvider('deepseek-account'), true)
  assert.equal(internals.isOfficialProvider('scnet'), false)
  assert.equal(internals.isOfficialProvider(undefined), false)
})

test('宿主半：session-usage 带出最近一次请求的 provider / model', () => {
  assert.ok(hostSource.includes('config.provider'), 'foldEvents 必须记录 request/header 的 provider')
  assert.ok(hostSource.includes('fold.provider = currentProvider'))
  assert.ok(hostSource.includes('fold.model = currentModel'))
})

test('宿主半不再引用已被删掉的 themeMarkInjection', () => {
  assert.ok(!hostSource.includes('themeMarkInjection'))
  assert.ok(hostSource.includes('configMarkInjection'))
})

await Promise.all(pending)
console.log('\n' + passed + ' 项通过' + (process.exitCode ? '（有失败）' : ''))
