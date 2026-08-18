window.__ModuleLoader__.load({
  id: "dsh-enhance",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    const React = require("react");

    const CSS = `
      html, body {
        overscroll-behavior: none;
        overscroll-behavior-block: none;
      }
      * {
        --dsh-chat-content-width: 94% !important;
      }
      [data-chat-flow] {
        gap: 8px !important;
      }
      [data-slot="conversation.input.dock"] > div {
        max-width: var(--dsh-chat-content-width) !important;
      }
      body:not([data-ds-dark-theme]) {
        --dsw-alias-bg-layer-3: #eee8d5 !important;
        --dsw-specific-menu: #eee8d5 !important;
        --dsw-specific-input-major: #ddd6c1 !important;
        --dsw-specific-login-input: #ddd6c1 !important;
        --dsw-specific-tip: #eee8d5 !important;
        --dsw-specific-selector: #eee8d5 !important;
        --dsw-specific-bubble: #eee8d5 !important;
        --dsw-specific-bubble-highlight: #e4dcc4 !important;
        --dsw-specific-sidebar-nav-item-active: #eee8d5 !important;
        --dsw-specific-sidebar-nav-item-hover: #e6dfc8 !important;
        --dsw-specific-sidebar-nav-item-active-accent: #e6dfc8 !important;
        --dsw-alias-markdown-code-block: #eee8d5 !important;
        --dsw-alias-markdown-code-block-banner: #e6dfc8 !important;
        --dsw-alias-markdown-inline-code: #e6dfc8 !important;
        --dsw-alias-markdown-code-segment-unselected: #e6dfc8 !important;
        --dsw-alias-markdown-citation: #e6dfc8 !important;
        --dsw-alias-label-tertiary: #93a1a1 !important;
        --dsw-alias-label-caption: #93a1a1 !important;
        --dsw-alias-label-dimmed: #cdc4a3 !important;
        --dsw-alias-interactive-bg-hover: rgba(223, 202, 136, 0.22) !important;
        --dsw-alias-interactive-bg-hover-solid: rgba(223, 202, 136, 0.32) !important;
        --dsw-alias-interactive-bg-active: rgba(181, 137, 0, 0.12) !important;
        --dsw-alias-interactive-bg-hover-accent: rgba(38, 139, 210, 0.12) !important;
        --dsw-alias-interactive-bg-hover-danger: rgba(220, 50, 47, 0.08) !important;
        --dsw-alias-button-primary-fill: #ac9d57 !important;
        --dsw-alias-button-primary-hover: #b8a968 !important;
        --dsw-alias-button-primary-dimmed: #e6dfc8 !important;
        --dsw-alias-button-info-fill: #268bd2 !important;
        --dsw-alias-button-info-hover: #58a6d8 !important;
        --dsw-alias-button-contrast-fill: #073642 !important;
        --dsw-alias-button-floating-fill: #fdf6e3 !important;
        --dsw-alias-button-floating-hover: #eee8d5 !important;
        --dsw-alias-button-elevated-fill: #fdf6e3 !important;
        --dsw-alias-button-ghost-active-fill: #eee8d5 !important;
        --dsw-alias-button-ghost-active-border: #c9bfa4 !important;
        --dsw-alias-tooltip-bg: #073642 !important;
        --dsw-alias-toast-bg: #073642 !important;
        --dsw-hovercard-bg: #073642 !important;
        --dsw-alias-border-inverted: #d3af86 !important;
        --dsw-alias-border-l3: #cdc4a3 !important;
        --dsw-alias-border-l4: #b8ae8e !important;
        --dsw-alias-border-l2-darkmode-thin: #c9bfa4 !important;
        --dsw-alias-bg-skeleton: rgba(88, 110, 117, 0.08) !important;
        --dsw-alias-scrollbar-bg-l1: #d8d0b2 !important;
        --dsw-alias-scrollbar-bg-l2: #d8d0b2 !important;
        --dsw-alias-scrollbar-hover-l1: #c9bfa4 !important;
        --dsw-alias-scrollbar-hover-l2: #c9bfa4 !important;
      }
      [data-slot="conversation.composer.dock"] {
        display: flex !important;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      [data-slot="conversation.composer.dock"] > div:first-child {
        flex: 1 1 auto;
        min-width: 0;
        width: auto !important;
      }
      .dsh-balance-cell{display:inline-flex;align-items:center;gap:6px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);white-space:nowrap;flex:none;padding-top:4px}
      .dsh-balance-cell .dsh-balance-val{cursor:pointer;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;text-decoration:none}
      .dsh-balance-cell .dsh-balance-val:hover{color:var(--dsw-alias-brand-primary)}
      .dsh-balance-chart{width:15px;height:15px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;padding:0}
      .dsh-balance-chart:hover{color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover)}
      .dsh-balance-err{color:var(--dsw-alias-state-warn-primary);cursor:pointer}
      .dsh-usage-backdrop{position:fixed;inset:0;z-index:1000;background:color-mix(in srgb, var(--dsw-alias-bg-base) 55%, transparent);display:flex;align-items:center;justify-content:center}
      .dsh-usage-panel{width:min(760px,92vw);max-height:84vh;overflow:auto;box-sizing:border-box;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:16px;box-shadow:var(--dsw-shadow-lv3);padding:16px 20px;color:var(--dsw-alias-label-primary)}
      .dsh-usage-header{display:flex;align-items:center;gap:12px;margin-bottom:4px}
      .dsh-usage-title{font-size:15px;font-weight:600;flex:1;margin:0}
      .dsh-usage-sub{font-size:12px;color:var(--dsw-alias-label-tertiary);margin:0 0 10px}
      .dsh-usage-btn{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);border-radius:8px;padding:4px 10px;font-size:12px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}
      .dsh-usage-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}
      .dsh-usage-summary{display:flex;gap:18px;flex-wrap:wrap;margin:10px 0 4px;font-size:12px;color:var(--dsw-alias-label-secondary)}
      .dsh-usage-summary b{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}
      .dsh-usage-legend{display:flex;gap:14px;font-size:12px;color:var(--dsw-alias-label-secondary);margin-top:10px}
      .dsh-usage-dot{width:8px;height:8px;border-radius:2px;display:inline-block;margin-right:4px;vertical-align:middle}
      .dsh-usage-empty{color:var(--dsw-alias-label-tertiary);font-size:12px;padding:24px 0;text-align:center}
      .dsh-chart-cache{fill:var(--dsw-alias-state-success-primary)}
      .dsh-chart-input{fill:var(--dsw-alias-brand-primary)}
      .dsh-chart-output{fill:#a78bfa}
      .dsh-usage-axis{fill:var(--dsw-alias-label-tertiary);font-size:9px}
      /* ---- 工具调用折叠条 ---- */
      .dsh-round{display:flex;flex-wrap:wrap;align-items:center;gap:6px;min-width:0;max-width:100%;overflow-anchor:none}
      .dsh-tool-strip{display:flex;flex-wrap:wrap;align-items:center;gap:2px 4px;width:fit-content;max-width:100%;min-width:0;padding:2px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;background:var(--dsw-alias-interactive-bg-hover);cursor:pointer;user-select:none;font-size:12px;line-height:20px;color:var(--dsw-alias-label-secondary);overflow:hidden;overflow-anchor:none}
      .dsh-tool-strip:hover{background:var(--dsw-alias-interactive-bg-hover-solid)}
      .dsh-tool-strip[data-open="1"]{cursor:default;background:var(--dsw-alias-interactive-bg-hover)}
      .dsh-tool-strip[data-kind="tool"]{display:flex;flex-direction:column;flex-wrap:nowrap;align-items:flex-start;gap:4px;width:100%;padding:0;border:0;border-radius:0;background:transparent;cursor:default;overflow:visible}
      .dsh-tool-strip[data-kind="tool"]:hover,.dsh-tool-strip[data-kind="tool"][data-open="1"]{background:transparent}
      .dsh-tool-line{display:flex;align-items:center;gap:2px 4px;box-sizing:border-box;width:fit-content;max-width:100%;padding:2px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;background:var(--dsw-alias-interactive-bg-hover);cursor:pointer;overflow:hidden}
      .dsh-tool-line:hover{background:var(--dsw-alias-interactive-bg-hover-solid)}
      .dsh-tool-strip[data-open="1"] .dsh-tool-line{cursor:default;background:var(--dsw-alias-interactive-bg-hover)}
      .dsh-tool-strip[data-kind="tool"].dsh-tool-measuring{flex-direction:row;flex-wrap:wrap;align-items:center;gap:2px 4px;box-sizing:border-box;padding:2px 10px;border:1px solid transparent}
      .dsh-tool-chip{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
      .dsh-tool-chip + .dsh-tool-chip::before{content:"→";color:var(--dsw-alias-label-caption);margin-right:4px}
      .dsh-tool-dot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-label-caption);flex:none}
      .dsh-tool-dot[data-st="ok"]{background:var(--dsw-alias-state-success-primary)}
      .dsh-tool-dot[data-st="error"]{background:var(--dsw-alias-state-error-primary)}
      .dsh-tool-dot[data-st="running"]{background:var(--dsw-alias-state-business-primary)}
      .dsh-tool-name{font-weight:500}
      .dsh-tool-count{color:var(--dsw-alias-label-caption)}
      .dsh-tool-collapse{margin-left:2px;padding:0 4px;color:var(--dsw-alias-label-caption);border-radius:4px;cursor:pointer}
      .dsh-tool-collapse:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}
      .dsh-tool-chip{max-width:220px}
      .dsh-tool-name{overflow:hidden;text-overflow:ellipsis}
      /* ---- 三段式折叠:中间产物默认隐藏(插入即隐藏,无高度突变/滚动跳动),胶囊展开时显示 ---- */
      [data-chat-flow] > [data-chat-flow-kind="tool-call"],
      [data-chat-flow] > [data-chat-flow-kind="context"] { display:none !important }
      [data-chat-flow] > [data-chat-flow-kind="assistant-step"] [data-variant="think"] { display:none !important }
      [data-chat-flow] > [data-chat-flow-kind="assistant-step"] [data-tool] { display:none !important }
      [data-chat-flow] > [data-chat-flow-kind="assistant-step"] :has(> [data-sample="bash"]) { display:none !important }
      [data-chat-flow] > [data-chat-flow-kind="tool-call"].dsh-ec-show,
      [data-chat-flow] > [data-chat-flow-kind="context"].dsh-ec-show { display:block !important }
      [data-chat-flow] > [data-chat-flow-kind="assistant-step"].dsh-ec-think-open [data-variant="think"] { display:flex !important }
      [data-chat-flow] > [data-chat-flow-kind="assistant-step"].dsh-ec-tools-open [data-tool] { display:flex !important }
      [data-chat-flow] > [data-chat-flow-kind="assistant-step"].dsh-ec-tools-open :has(> [data-sample="bash"]) { display:flex !important }
    `;

    // 仅在目标机安装了 Maple Mono 时注入字体覆盖,否则完全不动字体(保持 DSH 默认)
    const FONT_CSS = `
      :root, body {
        --dsw-font-family: 'Maple Mono', 'PingFang SC', ui-monospace, 'SF Mono', Menlo, monospace !important;
        --ds-font-family-code: 'Maple Mono', 'PingFang SC', ui-monospace, 'SF Mono', Menlo, monospace !important;
        --dsw-font-xl-24: 600 22px/28px var(--dsw-font-family) !important;
        --dsw-font-l-20: 500 19px/25px var(--dsw-font-family) !important;
        --dsw-font-m-18: 500 15px/22px var(--dsw-font-family) !important;
        --dsw-font-base-16: 15px/21px var(--dsw-font-family) !important;
        --dsw-font-base-strong-16: 500 15px/21px var(--dsw-font-family) !important;
        --dsw-font-s-14: 13px/18px var(--dsw-font-family) !important;
        --dsw-font-s-strong-14: 500 13px/18px var(--dsw-font-family) !important;
        --dsw-font-xs-13: 12px/16px var(--dsw-font-family) !important;
        --dsw-font-xs-strong-13: 500 12px/16px var(--dsw-font-family) !important;
        --dsw-font-xxs-12: 11px/15px var(--dsw-font-family) !important;
        --dsw-font-xxs-strong-12: 500 11px/15px var(--dsw-font-family) !important;
        --dsw-font-xxxs-11: 11px/13px var(--dsw-font-family) !important;
        --dsw-font-xxxs-strong-11: 500 11px/13px var(--dsw-font-family) !important;
        --dsw-font-markdown-h1: 700 22px/28px var(--dsw-font-family) !important;
        --dsw-font-markdown-h2: 700 20px/26px var(--dsw-font-family) !important;
        --dsw-font-markdown-h3: 700 18px/24px var(--dsw-font-family) !important;
        --dsw-font-markdown-h4: 600 15px/22px var(--dsw-font-family) !important;
        --dsw-font-markdown-base: 15px/22px var(--dsw-font-family) !important;
        --dsw-font-markdown-base-strong: 600 15px/22px var(--dsw-font-family) !important;
        --dsw-font-markdown-base-italic: italic 15px/22px var(--dsw-font-family) !important;
        --dsw-font-markdown-base-strong-italic: italic 600 15px/22px var(--dsw-font-family) !important;
        --dsw-font-markdown-small: 13px/19px var(--dsw-font-family) !important;
        --dsw-font-markdown-small-strong: 600 13px/19px var(--dsw-font-family) !important;
        --dsw-font-markdown-small-italic: italic 13px/19px var(--dsw-font-family) !important;
        --dsw-font-markdown-small-strong-italic: italic 600 13px/19px var(--dsw-font-family) !important;
        --dsw-font-markdown-table: 14px/21px var(--dsw-font-family) !important;
        --dsw-font-markdown-table-head: 500 14px/21px var(--dsw-font-family) !important;
        --dsw-font-markdown-code: 13px/18px var(--ds-font-family-code) !important;
        --dsw-font-markdown-code-block: 12px/17px var(--ds-font-family-code) !important;
        --dsw-font-markdown-code-block-small: 11px/15px var(--ds-font-family-code) !important;
      }
    `;

    // 通过 canvas 测量文字宽度判断 Maple Mono 是否已安装(不存在时回退到等宽字体,宽度一致)
    function mapleMonoAvailable() {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return false;
        const text = "mMMMMmmmlllii0123456789";
        const measure = (stack) => { ctx.font = "72px " + stack; return ctx.measureText(text).width; };
        const mono = measure("monospace");
        const serif = measure("serif");
        const maple = measure('"Maple Mono", monospace');
        return maple !== mono && maple !== serif;
      } catch (_) {
        return false;
      }
    }

    const SOLARIZED_LIGHT = {
      "--dsw-alias-bg-base": "#fdf6e3",
      "--dsw-alias-bg-layer-1": "#eee8d5",
      "--dsw-alias-bg-layer-2": "#e6dfc8",
      "--dsw-alias-bg-overlay": "#eee8d5",
      "--dsw-alias-border-l1": "#e4dcc4",
      "--dsw-alias-border-l2": "#c9bfa4",
      "--dsw-alias-brand-primary": "#268bd2",
      "--dsw-alias-label-primary": "#586e75",
      "--dsw-alias-label-secondary": "#657b83",
      "--dsw-alias-state-error-primary": "#dc322f",
      "--dsw-alias-state-success-primary": "#859900",
      "--dsw-alias-state-warn-primary": "#b58900",
      "--dsw-specific-sidebar-fill": "#eee8d5",
    };
    const DARK_PRESERVE = {
      "--dsw-alias-bg-base": "rgb(21, 21, 23)",
      "--dsw-alias-bg-layer-1": "rgb(35, 35, 36)",
      "--dsw-alias-bg-layer-2": "rgb(44, 44, 46)",
      "--dsw-alias-bg-overlay": "rgb(97, 102, 107)",
      "--dsw-alias-border-l1": "rgba(255, 255, 255, 0.06)",
      "--dsw-alias-border-l2": "rgba(255, 255, 255, 0.12)",
      "--dsw-alias-brand-primary": "rgb(249, 250, 251)",
      "--dsw-alias-label-primary": "rgb(249, 250, 251)",
      "--dsw-alias-label-secondary": "rgb(207, 211, 214)",
      "--dsw-alias-state-error-primary": "rgb(242, 90, 90)",
      "--dsw-alias-state-success-primary": "rgb(34, 197, 94)",
      "--dsw-alias-state-warn-primary": "rgb(245, 158, 11)",
      "--dsw-specific-sidebar-fill": "rgb(27, 27, 28)",
    };

    function api(path) {
      return fetch("/enh/" + path).then((r) => r.json());
    }

    function fmt(n) {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
      if (n >= 1000) return (n / 1000).toFixed(1) + "K";
      return String(n);
    }
    function fmtCost(c) {
      const v = Number(c);
      if (!Number.isFinite(v) || v < 0) return "¥0";
      return v >= 1 ? "¥" + v.toFixed(2) : "¥" + v.toFixed(4);
    }

    function Bars({ steps, W, H, dense }) {
      const PAD = 4, BASE = H - 4;
      const maxV = Math.max(1, ...steps.map((s) => (s.input + s.output + s.cacheRead)));
      const bw = (W - PAD * 2) / steps.length;
      const segs = [];
      steps.forEach((s, i) => {
        const x = PAD + i * bw;
        const hCache = s.cacheRead / maxV * (BASE - 14);
        const hIn = s.input / maxV * (BASE - 14);
        const hOut = s.output / maxV * (BASE - 14);
        const tip = (dense ? ("第 " + s.idx + " 次请求" + (s.time ? " · " + new Date(s.time).toLocaleTimeString() : "")) : s.date) + " · 缓存 " + fmt(s.cacheRead) + " · 输入 " + fmt(s.input) + " · 输出 " + fmt(s.output) + " · 成本 " + fmtCost(s.cost);
        segs.push(React.createElement("g", { key: i },
          React.createElement("title", null, tip),
          hCache > 0 && React.createElement("rect", { x: x + 1, y: BASE - hCache, width: Math.max(1, bw - 2), height: hCache, rx: 1, className: "dsh-chart-cache" }),
          hIn > 0 && React.createElement("rect", { x: x + 1, y: BASE - hCache - hIn, width: Math.max(1, bw - 2), height: hIn, rx: 1, className: "dsh-chart-input" }),
          hOut > 0 && React.createElement("rect", { x: x + 1, y: BASE - hCache - hIn - hOut, width: Math.max(1, bw - 2), height: hOut, rx: 1, className: "dsh-chart-output" }),
          (dense ? (i % 10 === 0 || i === steps.length - 1) : (i % 5 === 0 || i === steps.length - 1)) && React.createElement("text", { x: x + bw / 2, y: H, textAnchor: "middle", className: "dsh-usage-axis" }, dense ? s.idx : s.date)));
      });
      return React.createElement("svg", { width: "100%", viewBox: "0 0 " + W + " " + H, role: "img" }, segs);
    }

    function UsageOverlay() {
      const [open, setOpenLocal] = React.useState(false);
      const [data, setData] = React.useState(null);
      const [loading, setLoading] = React.useState(false);
      const listeners = React.useRef(null);
      if (listeners.current === null) listeners.current = { set: new Set(), setOpen(v) { this.set.forEach((fn) => fn(v)); } };
      React.useEffect(() => {
        const fn = (v) => setOpenLocal(v);
        listeners.current.set.add(fn);
        return () => { listeners.current.set.delete(fn); };
      }, []);
      const load = () => {
        setLoading(true);
        api("usage").then((r) => { setData(r); setLoading(false); }).catch(() => { setData({ error: "查询失败" }); setLoading(false); });
      };
      React.useEffect(() => { if (open && data === null && !loading) load(); }, [open]);
      if (!open) return null;
      const total = (data && !data.error && data.total) ? data.total : null;
      return React.createElement("div", { className: "dsh-usage-backdrop", onClick: () => listeners.current.setOpen(false) },
        React.createElement("div", { className: "dsh-usage-panel", onClick: (e) => e.stopPropagation() },
          React.createElement("div", { className: "dsh-usage-header" },
            React.createElement("h3", { className: "dsh-usage-title" }, "用量统计 · 近 30 天"),
            React.createElement("button", { className: "dsh-usage-btn", onClick: load, disabled: loading }, loading ? "查询中…" : "刷新"),
            React.createElement("a", { className: "dsh-usage-btn", href: "https://platform.deepseek.com/usage", target: "_blank", rel: "noreferrer" }, "查看官方页面 ↗"),
            React.createElement("button", { className: "dsh-usage-btn", onClick: () => listeners.current.setOpen(false) }, "关闭")),
          React.createElement("p", { className: "dsh-usage-sub" }, "数据来源:DSH 本地会话日志(最近 " + (data && !data.error ? data.sessionsScanned : "?") + " 个会话,含子代理)· 成本按每次请求的模型与时间自动计价(8/17 起官方峰谷价,北京时间 9-12、14-18 高峰,空闲半价)"),
          data === null && React.createElement("div", { className: "dsh-usage-empty" }, "加载中…"),
          data !== null && data.error && React.createElement("div", { className: "dsh-usage-empty" }, data.error),
          data !== null && !data.error && React.createElement("div", null,
            React.createElement("div", { className: "dsh-usage-summary" },
              React.createElement("span", null, "请求 ", React.createElement("b", null, fmt(data.requests)), " 次"),
              React.createElement("span", null, "输入 ", React.createElement("b", null, fmt(total.input)), " tok"),
              React.createElement("span", null, "缓存读取 ", React.createElement("b", null, fmt(total.cacheRead)), " tok"),
              React.createElement("span", null, "输出 ", React.createElement("b", null, fmt(total.output)), " tok"),
              React.createElement("span", null, "总成本 ", React.createElement("b", null, fmtCost(data.totalCost)))),
            data.days.length > 0 && React.createElement(Bars, { steps: data.days, W: 640, H: 180, dense: false }),
            data.days.length === 0 && React.createElement("div", { className: "dsh-usage-empty" }, "近 30 天没有会话用量记录"),
            React.createElement("div", { className: "dsh-usage-legend" },
              React.createElement("span", null, React.createElement("span", { className: "dsh-usage-dot", style: { background: "var(--dsw-alias-state-success-primary)" } }), "缓存读取"),
              React.createElement("span", null, React.createElement("span", { className: "dsh-usage-dot", style: { background: "var(--dsw-alias-brand-primary)" } }), "输入(非缓存)"),
              React.createElement("span", null, React.createElement("span", { className: "dsh-usage-dot", style: { background: "#a78bfa" } }), "输出")))));
    }

    function SessionOverlay() {
      const [open, setOpenLocal] = React.useState(false);
      const [fold, setFold] = React.useState({ input: 0, cacheRead: 0, output: 0, cost: 0, requests: 0, steps: [] });
      const listeners = React.useRef(null);
      if (listeners.current === null) listeners.current = { set: new Set(), setOpen(v) { this.set.forEach((fn) => fn(v)); }, open(f) { this.fold = f; } };
      React.useEffect(() => {
        const fn = (v) => setOpenLocal(v);
        listeners.current.set.add(fn);
        return () => { listeners.current.set.delete(fn); };
      }, []);
      if (!open) return null;
      const d = fold;
      return React.createElement("div", { className: "dsh-usage-backdrop", onClick: () => listeners.current.setOpen(false) },
        React.createElement("div", { className: "dsh-usage-panel", onClick: (e) => e.stopPropagation() },
          React.createElement("div", { className: "dsh-usage-header" },
            React.createElement("h3", { className: "dsh-usage-title" }, "本轮用量 · " + d.requests + " 次请求"),
            React.createElement("button", { className: "dsh-usage-btn", onClick: () => listeners.current.setOpen(false) }, "关闭")),
          React.createElement("p", { className: "dsh-usage-sub" }, "数据来源:本会话完整日志(不受界面加载窗口影响)· 成本按每次请求的模型与时间自动计价(官方峰谷价:北京时间 9-12、14-18 高峰,空闲半价;8/17 前为现行价)"),
          React.createElement("div", { className: "dsh-usage-summary" },
            React.createElement("span", null, "输入 ", React.createElement("b", null, fmt(d.input)), " tok"),
            React.createElement("span", null, "缓存读取 ", React.createElement("b", null, fmt(d.cacheRead)), " tok"),
            React.createElement("span", null, "输出 ", React.createElement("b", null, fmt(d.output)), " tok"),
            React.createElement("span", null, "合计 ", React.createElement("b", null, fmtCost(d.cost)))),
          d.steps.length > 0 && React.createElement(Bars, { steps: d.steps, W: 640, H: 150, dense: true }),
          d.steps.length === 0 && React.createElement("div", { className: "dsh-usage-empty" }, "本会话还没有带用量记录的消息"),
          React.createElement("div", { className: "dsh-usage-legend" },
            React.createElement("span", null, React.createElement("span", { className: "dsh-usage-dot", style: { background: "var(--dsw-alias-state-success-primary)" } }), "缓存读取"),
            React.createElement("span", null, React.createElement("span", { className: "dsh-usage-dot", style: { background: "var(--dsw-alias-brand-primary)" } }), "输入(非缓存)"),
            React.createElement("span", null, React.createElement("span", { className: "dsh-usage-dot", style: { background: "#a78bfa" } }), "输出"))));
    }

    function BalanceView() {
      const [state, setState] = React.useState(null);
      const [openOverlay, setOpenOverlay] = React.useState(false);
      React.useEffect(() => {
        let alive = true;
        const load = () => {
          api("balance").then((result) => { if (alive) setState(result); }).catch(() => { if (alive) setState({ error: "查询失败" }); });
        };
        load();
        const timer = setInterval(load, 300000);
        return () => { alive = false; clearInterval(timer); };
      }, []);
      if (openOverlay) {
        return React.createElement(UsageOverlay, null);
      }
      if (state === null) {
        return React.createElement("span", { className: "dsh-balance-cell" }, React.createElement("span", null, "余额查询中…"));
      }
      if (state.error) {
        return React.createElement("span", { className: "dsh-balance-cell" }, React.createElement("span", {
          className: "dsh-balance-err",
          title: state.error,
          onClick: () => { api("balance").then(setState).catch(() => {}); },
        }, "余额 " + state.error));
      }
      const currency = state.currency || "CNY";
      const symbol = currency === "CNY" ? "¥" : currency === "USD" ? "$" : "";
      const text = symbol + state.total + (currency !== "CNY" && currency !== "USD" ? " " + currency : "");
      return React.createElement("span", { className: "dsh-balance-cell" },
        React.createElement("span", null, "余额"),
        React.createElement("a", {
          className: "dsh-balance-val",
          href: "https://platform.deepseek.com/usage",
          target: "_blank",
          rel: "noreferrer",
          title: "打开官方页面:充值或查看官方用量(查询于 " + new Date(state.fetchedAt).toLocaleTimeString() + ")",
        }, text),
        React.createElement("button", {
          className: "dsh-balance-chart",
          title: "近 30 天用量图表(DSH 本地统计)",
          onClick: () => setOpenOverlay(true),
        },
          React.createElement("svg", { width: 10, height: 10, viewBox: "0 0 10 10", "aria-hidden": true },
            React.createElement("rect", { x: 1, y: 4, width: 2, height: 5, rx: 0.5, fill: "currentColor" }),
            React.createElement("rect", { x: 4, y: 2, width: 2, height: 7, rx: 0.5, fill: "currentColor" }),
            React.createElement("rect", { x: 7, y: 0.5, width: 2, height: 8.5, rx: 0.5, fill: "currentColor" }))));
    }

    function SessionCostView({ sessionId }) {
      const [data, setData] = React.useState(null);
      const [openOverlay, setOpenOverlay] = React.useState(false);
      React.useEffect(() => {
        if (typeof sessionId !== "string" || sessionId === "") return;
        let alive = true;
        const load = () => {
          api("session-usage?sessionId=" + encodeURIComponent(sessionId)).then((r) => { if (alive) setData(r); }).catch(() => { if (alive) setData({ error: true }); });
        };
        load();
        const timer = setInterval(load, 60000);
        return () => { alive = false; clearInterval(timer); };
      }, [sessionId]);
      const requests = data && !data.error ? data.requests : 0;
      const shown = data === null ? "…" : fmtCost(data && !data.error ? data.cost : undefined);
      return React.createElement("span", { className: "dsh-balance-cell" },
        React.createElement("span", null, "本轮"),
        React.createElement("span", {
          className: "dsh-balance-val",
          title: requests > 0 ? ("本轮 " + requests + " 次请求 · 点击查看图表") : "本会话暂无用量记录",
          onClick: () => {
            if (typeof sessionId !== "string" || sessionId === "") return;
            api("session-usage?sessionId=" + encodeURIComponent(sessionId)).then((r) => {
              if (r && !r.error) { setOpenOverlay(true); }
            }).catch(() => {});
          },
        }, shown),
        openOverlay && React.createElement(SessionOverlay, null));
    }

    function DockCell(props) {
      return React.createElement(React.Fragment, null,
        React.createElement(BalanceView, null),
        React.createElement(SessionCostView, props));
    }

    function apply(ctx) {
      const style = document.createElement("style");
      style.dataset.plugin = "dsh-enhance";
      style.dataset.pluginCss = "dsh-enhance";
      style.textContent = CSS + (mapleMonoAvailable() ? FONT_CSS : "");
      document.head.appendChild(style);

      // ---- 三段式折叠:每个对话轮次固定两个胶囊(思考聚合 + 工具链路),对话正常渲染 ----
      const stripState = new WeakMap(); // strip -> 'folded' | 'open'
      const FOLDABLE_KINDS = new Set(["tool-call", "context"]);
      // 工具卡片根元素可能带 data-tool(通用 ToolRow)或 data-sample(BashRow 等自定义视图)
      const toolCardName = (el) => capName(el.getAttribute("data-tool") || el.getAttribute("data-sample") || "工具");
      const hasToolCard = (el) => el.querySelector("[data-tool]") !== null || el.querySelector("[data-sample]") !== null;
      const isStepMid = (el) => {
        if (el.getAttribute("data-chat-flow-kind") !== "assistant-step") return false;
        return el.querySelector('[data-variant="think"]') !== null || hasToolCard(el);
      };
      const isMidItem = (el) => el && el.nodeType === 1 && el.getAttribute && (FOLDABLE_KINDS.has(el.getAttribute("data-chat-flow-kind")) || isStepMid(el));
      const isRound = (el) => el && el.nodeType === 1 && el.classList && el.classList.contains("dsh-round");
      const capName = (name) => name.charAt(0).toUpperCase() + name.slice(1);
      const dotClassOf = (state) => (state === "ok" ? "ok" : state === "error" ? "error" : state === "" ? "" : "running");
      // 段内统计:思考总数/运行态 + 工具链路(按出现顺序)
      const segInfo = (items) => {
        let thinks = 0;
        let thinkRunning = false;
        const tools = [];
        for (const item of items) {
          const kind = item.getAttribute("data-chat-flow-kind");
          if (kind === "assistant-step") {
            const ts = item.querySelectorAll('[data-variant="think"]');
            thinks += ts.length;
            for (const t of ts) if ((t.getAttribute("data-state") || "") === "running") thinkRunning = true;
            const tls = item.querySelectorAll("[data-tool], [data-sample]");
            for (const tl of tls) tools.push({ name: toolCardName(tl), state: tl.getAttribute("data-state") || "" });
          } else if (kind === "context") {
            const src = item.querySelector("[data-context-source]");
            tools.push({ name: src ? ((src.textContent || "").trim().split(",")[0] || "上下文") : "上下文", state: "" });
          } else {
            const t = item.querySelector("[data-tool]") || item.querySelector("[data-sample]");
            tools.push({ name: t ? toolCardName(t) : "工具", state: t ? (t.getAttribute("data-state") || "") : "" });
          }
        }
        return { thinks, thinkRunning, tools };
      };
      const chipHtml = (name, state) => {
        const cls = dotClassOf(state);
        const dot = cls ? `<span class="dsh-tool-dot" data-st="${cls}"></span>` : "";
        return `<span class="dsh-tool-chip">${dot}<span class="dsh-tool-name">${name}</span></span>`;
      };
      const buildThinkHtml = (info, open) => {
        const dot = info.thinkRunning ? `<span class="dsh-tool-dot" data-st="running"></span>` : "";
        let html = `<span class="dsh-tool-chip">${dot}<span class="dsh-tool-name">Think</span><span class="dsh-tool-count">×${info.thinks}</span></span>`;
        if (open) html += `<span class="dsh-tool-collapse" title="收起思考">▴ 收起</span>`;
        return html;
      };
      const buildToolsHtml = (info, open) => {
        let html = "";
        info.tools.forEach((t) => { html += chipHtml(t.name, t.state); });
        if (open) html += `<span class="dsh-tool-collapse" title="收起工具链路">▴ 收起</span>`;
        return html;
      };
      // 先交给 flex 计算真实换行位置，再把每个视觉行包成独立胶囊。
      // 新行从工具名开始，不继承上一行末尾的连接箭头。
      const layoutToolStrip = (strip, force) => {
        if (!strip || strip.dataset.kind !== "tool") return;
        const round = strip.parentElement;
        if (!round) return;
        const width = Math.floor(round.getBoundingClientRect().width);
        if (width <= 0 || (!force && strip.dataset.layoutWidth === String(width))) return;
        const items = [];
        for (const child of Array.from(strip.children)) {
          if (child.classList.contains("dsh-tool-line")) items.push(...Array.from(child.children));
          else items.push(child);
        }
        if (items.length === 0) return;
        strip.dataset.layoutWidth = String(width);
        strip.replaceChildren(...items);
        strip.classList.add("dsh-tool-measuring");
        const rows = [];
        let row = [];
        let rowTop = null;
        for (const item of items) {
          const top = item.offsetTop;
          if (rowTop !== null && Math.abs(top - rowTop) > 1) {
            rows.push(row);
            row = [];
          }
          if (row.length === 0) rowTop = top;
          row.push(item);
        }
        if (row.length > 0) rows.push(row);
        strip.classList.remove("dsh-tool-measuring");
        const fragment = document.createDocumentFragment();
        for (const rowItems of rows) {
          const line = document.createElement("div");
          line.className = "dsh-tool-line";
          line.append(...rowItems);
          fragment.appendChild(line);
        }
        strip.replaceChildren(fragment);
      };
      const toolStripResizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver((entries) => {
        for (const entry of entries) {
          const round = entry.target;
          for (const strip of round.querySelectorAll(':scope > .dsh-tool-strip[data-kind="tool"]')) layoutToolStrip(strip, false);
        }
      }) : null;
      const findRound = (flow, first) => {
        const prev = first.previousElementSibling;
        return (prev && prev.classList && prev.classList.contains("dsh-round")) ? prev : null;
      };
      const createRound = (flow, first) => {
        const round = document.createElement("div");
        round.className = "dsh-round";
        flow.insertBefore(round, first);
        if (toolStripResizeObserver) toolStripResizeObserver.observe(round);
        return round;
      };
      const stripInRound = (round, kind) => {
        for (const child of round.children) {
          if (child.classList && child.classList.contains("dsh-tool-strip") && child.dataset.kind === kind) return child;
        }
        return null;
      };
      const createStripInRound = (round, kind) => {
        const strip = document.createElement("div");
        strip.className = "dsh-tool-strip";
        strip.dataset.kind = kind;
        strip.setAttribute("role", "button");
        strip.setAttribute("tabindex", "0");
        strip.setAttribute("aria-expanded", "false");
        strip.title = kind === "think" ? "展开全部思考" : "展开工具链路";
        // think 始终在前, tool 始终在后
        if (kind === "think") round.insertBefore(strip, round.firstChild);
        else round.appendChild(strip);
        stripState.set(strip, "folded");
        return strip;
      };
      const setThinkOpen = (item, open) => {
        if (isStepMid(item)) item.classList.toggle("dsh-ec-think-open", open);
      };
      const setToolsOpen = (item, open) => {
        if (isStepMid(item)) item.classList.toggle("dsh-ec-tools-open", open);
        else item.classList.toggle("dsh-ec-show", open);
      };
      const applySegment = (flow, items, force) => {
        const info = segInfo(items);
        const first = items[0];
        const groupKey = items.map((c) => c.getAttribute("data-chat-flow-key") || "").join("|");
        const hasThink = info.thinks > 0;
        const hasTools = info.tools.length > 0;
        if (!hasThink && !hasTools) {
          const round = findRound(flow, first);
          if (round) round.remove();
          return;
        }
        const round = findRound(flow, first) || createRound(flow, first);
        // 思考胶囊:仅当段内有思考时渲染
        if (hasThink) {
          const strip = stripInRound(round, "think") || createStripInRound(round, "think");
          const open = stripState.get(strip) === "open";
          const keys = groupKey + ":t" + info.thinks + (info.thinkRunning ? "r" : "");
          if (force || strip.dataset.keys !== keys || strip.dataset.open !== (open ? "1" : "")) {
            strip.dataset.keys = keys;
            strip.dataset.open = open ? "1" : "";
            strip.setAttribute("aria-expanded", open ? "true" : "false");
            strip.innerHTML = buildThinkHtml(info, open);
            diagRebuild += 1;
          }
          items.forEach((item) => setThinkOpen(item, open));
        } else {
          const strip = stripInRound(round, "think");
          if (strip) { strip.remove(); stripState.delete(strip); }
          items.forEach((item) => setThinkOpen(item, false));
        }
        // 工具胶囊:仅当段内有工具调用时渲染
        if (hasTools) {
          const strip = stripInRound(round, "tool") || createStripInRound(round, "tool");
          const open = stripState.get(strip) === "open";
          const keys = groupKey + ":u" + info.tools.length;
          if (force || strip.dataset.keys !== keys || strip.dataset.open !== (open ? "1" : "")) {
            strip.dataset.keys = keys;
            strip.dataset.open = open ? "1" : "";
            strip.setAttribute("aria-expanded", open ? "true" : "false");
            strip.innerHTML = buildToolsHtml(info, open);
            layoutToolStrip(strip, true);
            diagRebuild += 1;
          }
          items.forEach((item) => setToolsOpen(item, open));
        } else {
          const strip = stripInRound(round, "tool");
          if (strip) { strip.remove(); stripState.delete(strip); }
          items.forEach((item) => setToolsOpen(item, false));
        }
      };
      const groupOf = (strip) => {
        const round = strip.parentElement;
        const flow = round.parentElement;
        const items = [];
        let n = round.nextElementSibling;
        while (n && isMidItem(n)) { items.push(n); n = n.nextElementSibling; }
        return { flow, items };
      };
      const scanFlow = (flow, force) => {
        // 清理孤儿轮容器:其后既无中间节点也无其他轮容器(段被 React 移除),才删除
        for (const round of flow.querySelectorAll(":scope > .dsh-round")) {
          const next = round.nextElementSibling;
          if (!isMidItem(next) && !isRound(next)) {
            if (toolStripResizeObserver) toolStripResizeObserver.unobserve(round);
            round.remove();
          }
        }
        let group = [];
        for (const child of flow.children) {
          if (isMidItem(child)) {
            group.push(child);
          } else if (group.length > 0) {
            applySegment(flow, group, force);
            group = [];
          }
        }
        if (group.length > 0) applySegment(flow, group, force);
      };
      const scanAll = (force) => {
        document.querySelectorAll("[data-chat-flow]").forEach((flow) => scanFlow(flow, force));
      };
      const onStripToggle = (strip, open) => {
        stripState.set(strip, open ? "open" : "folded");
        const { flow, items } = groupOf(strip);
        if (items.length > 0) applySegment(flow, items);
      };
      document.addEventListener("click", (event) => {
        const target = event.target;
        if (!target || typeof target.closest !== "function") return;
        const strip = target.closest(".dsh-tool-strip");
        if (!strip) return;
        if (target.closest(".dsh-tool-collapse")) { onStripToggle(strip, false); return; }
        if (strip.dataset.open !== "1") onStripToggle(strip, true);
      });
      document.addEventListener("keydown", (event) => {
        const target = event.target;
        if (!target || typeof target.closest !== "function") return;
        if (event.key !== "Enter" && event.key !== " ") return;
        const strip = target.closest(".dsh-tool-strip");
        if (!strip) return;
        event.preventDefault();
        onStripToggle(strip, strip.dataset.open !== "1");
      });
      // 只处理与折叠分组相关的变化:flow 直接子层增删、think/工具元素出现
      // (忽略卡片内部渲染如终端输出逐行插入、文本流式,避免高频扫描与重建)
      const relevantMutation = (m) => {
        if (m.type !== "childList") return false;
        const target = m.target;
        if (!(target instanceof Element)) return false;
        if (target.closest("[data-chat-flow]") === null) return false;
        if (target === target.closest("[data-chat-flow]")) return true;
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.getAttribute && (node.getAttribute("data-chat-flow-kind") !== null || node.hasAttribute("data-tool") || node.hasAttribute("data-variant"))) return true;
        }
        return false;
      };
      let scheduled = false;
      let diagScan = 0;
      let diagRebuild = 0;
      // 滚动期间挂起扫描:虚拟列表滚动会插入/删除节点,此时重建胶囊会与浏览器滚动锚定打架
      // 停止 120ms 后兜底全量扫一次,滚动中错过的变更不会丢(scanAll 幂等)
      let scrollPending = false;
      let scrollRestTimer = null;
      document.addEventListener("scroll", () => {
        scrollPending = true;
        clearTimeout(scrollRestTimer);
        scrollRestTimer = setTimeout(() => {
          scrollPending = false;
          scanAll(false);
        }, 120);
      }, { capture: true, passive: true });
      const observer = new MutationObserver((mutations) => {
        let need = false;
        for (const m of mutations) {
          if (!relevantMutation(m)) continue;
          need = true;
          break;
        }
        if (!need) return;
        if (scrollPending || scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
          scheduled = false;
          diagScan += 1;
          scanAll(false);
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
      scanAll(false);
      setInterval(() => {
        console.debug("[dsh-enhance-diag] scan/5s=" + diagScan + " rebuild/5s=" + diagRebuild + " strips=" + document.querySelectorAll(".dsh-tool-strip").length);
        diagScan = 0;
        diagRebuild = 0;
      }, 5000);

      const theme = ctx.get("theme");
      if (theme !== undefined) {
        const overrides = {};
        for (const key of Object.keys(SOLARIZED_LIGHT)) {
          overrides[key] = { light: SOLARIZED_LIGHT[key], dark: DARK_PRESERVE[key] };
        }
        try {
          theme.overrideTokens("solarized-light", overrides);
        } catch (error) {
          console.error("[dsh-enhance] theme override failed", error);
        }
      }

      const slots = ctx.get("slots");
      if (slots === undefined) return;
      slots.inject("conversation.composer.dock", () => slots.register(
        { name: "conversation.composer.dock", id: "dsh-enhance-dock", order: 1 },
        (props) => React.createElement(DockCell, props),
      ));
      slots.inject("shell.overlay", () => slots.register(
        { name: "shell.overlay", id: "dsh-enhance-usage", order: 10 },
        () => React.createElement(UsageOverlay),
      ));
      slots.inject("shell.overlay", () => slots.register(
        { name: "shell.overlay", id: "dsh-enhance-session-usage", order: 11 },
        () => React.createElement(SessionOverlay),
      ));
    }

    exports.apply = apply;
    return module.exports;
  },
});
