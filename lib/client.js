window.__ModuleLoader__.load({
  id: "dsh-uxexo",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    const React = require("react");

    /**
     * 客户端半的构建号。必须与 lib/index.js 读取的 package.json version 一致：
     * 设置页拿它跟 GET /enh/ping 报出的宿主半构建号比对，不一致 = 宿主半还是旧进程，
     * 页面会提示「重启后完全生效」。改插件时三处一起改：这里、package.json.version、
     * lib/index.js 什么都不用改（它直接读 package.json）。
     */
    const CLIENT_BUILD = "2.0.0";

    /**
     * 布尔功能开关：状态落在 html 的 data-dsh-ux-<key> 属性上（on/off），
     * 由 host 在 index 注入的脚本于首帧前写好（避免先按官方配色画一帧再跳），
     * 设置页改动时立即改写属性 —— 所以全部功能都是即时开关，不需要重启。
     * 只有「宿主半没跟上」这一种情况需要重启，页面会明确提示，见 SettingsPage。
     * 字体方案与字重不是布尔，见 FONT_SCHEMES / FONT_WEIGHTS。
     */
    const FEATURES = [
      { key: "layout", group: "布局", title: "紧凑布局微调", desc: "加宽消息列、收紧对话间距、对齐新对话输入卡片与 / @ 候选菜单" },
      { key: "fold", group: "布局", title: "折叠胶囊", desc: "把思考块与工具调用聚合成 Think ×N 与链路胶囊，点击任一行展开" },
      { key: "usage", group: "数据", title: "账户余额与用量", desc: "输入框下方显示官方账户余额、本轮成本与近 30 天用量图表" },
      { key: "quietnew", group: "外观", title: "新会话按钮弱化", desc: "默认关闭（跟随主题强调色）。打开后左上角「新会话」只比侧栏底色略深一点，不再用强色" },
    ];
    const BOOL_KEYS = FEATURES.map((f) => f.key);

    /**
     * 字体方案（枚举，值是 html 属性 data-dsh-ux-font 的取值）。
     *
     * 依据《终端排版哲学：中文优先与 0.5 窄体等宽工程实战》：汉字自古以来是 1.0 正方，
     * 要让「2 个西文字符 = 1 个汉字」严格成立，西文必须收窄到 0.5。主流编程字体
     * （Menlo / JetBrains Mono / Fira Code / Maple Mono…）的西文都是 0.6~0.67，
     * 以它们为基准时汉字容器被撑到 1.2 —— 汉字要么被横向拉宽 20%（矮胖），要么两边留白。
     * 本机 CoreText 实测（unitsPerEm=1000，字形前沿宽度）：
     *   Sarasa Mono SC   西文 0.500 / 汉字 1.000，比值 2.000；— 1.000 → 1.000 ★ 1.000（全角）
     *   Sarasa Term SC   西文 0.500 / 汉字 1.000，比值 2.000；— 0.500 → 0.500 ★ 0.500（半角）
     *   Sarasa Gothic/UI SC 西文 0.562 / 汉字 1.000，比值 1.78 —— 不满足 0.5，故不提供
     *   Maple Mono NF CN 西文 0.600 / 汉字 1.200，比值 2.000 —— 汉字被拉宽 20%，正是要避开的那类
     *   Noto Sans Mono CJK SC 西文 0.500 / 汉字 1.000，比值 2.000，但只有 Regular/Bold
     * `families` 既是 CSS 家族名，也是可用性探测的目标（含别名，探测用 or 语义）。
     */
    const FONT_SCHEMES = [
      {
        key: "auto",
        label: "自动（推荐）",
        hint: "按可用性依次尝试：更纱黑体 Mono → Term → Noto Mono CJK → Maple Mono",
        families: ["Sarasa Mono SC", "Sarasa Term SC", "Noto Sans Mono CJK SC", "Maple Mono NF CN", "Maple Mono"],
      },
      {
        key: "sans-mono",
        label: "Sarasa Mono SC",
        hint: "宽高比 0.5 的西文 + 1.0 的思源黑体汉字；——……→★ 保持全角，最适合读 Markdown",
        families: ["Sarasa Mono SC"],
      },
      {
        key: "sans-term",
        label: "Sarasa Term SC",
        hint: "同为 0.5 窄体，但东亚歧义字符压成半角，网格最紧、跳格最稳",
        families: ["Sarasa Term SC"],
      },
      {
        key: "noto",
        label: "Noto Mono CJK",
        hint: "Noto Sans Mono CJK SC：也是 0.5/1.0，本机只有 Regular 与 Bold",
        families: ["Noto Sans Mono CJK SC"],
      },
      {
        key: "maple",
        label: "Maple Mono",
        hint: "旧观感：西文 0.6、汉字 1.2，汉字被拉宽 20%，不满足 0.5 规则",
        families: ["Maple Mono NF CN", "Maple Mono"],
      },
      { key: "off", label: "关闭", hint: "使用官方字体栈", families: [] },
    ];
    const FONT_SCHEME_KEYS = FONT_SCHEMES.map((s) => s.key);
    const FONT_WEIGHTS = [
      { key: "regular", label: "标准", hint: "正文 400 / 强调 500，保持官方字重" },
      { key: "semibold", label: "半粗", hint: "正文 600 / 强调 700 —— 用字族自带的矢量 SemiBold，文章推荐的甜点位" },
    ];
    const FONT_WEIGHT_KEYS = FONT_WEIGHTS.map((w) => w.key);

    /**
     * 文字墨色（枚举，值是 html 属性 data-dsh-ux-ink 的取值）。
     *
     * 配色层决定「底」，墨色只决定「字」。Solarized 的默认 primary 是 base01 #586e75
     * （青灰），在暖黄底上对比度只有 4.99:1，落到 layer-1 #eee8d5 更是 4.39:1（低于
     * WCAG AA 的 4.5），观感上就是「蒙了一层灰」。深墨换 Solarized 自己的 base03
     * #002b36（13.9:1），既够黑又不破坏配色的暖青气质；纯黑 19.5:1 留给强光/低视力。
     * 只作用于浅色：深色配色各自定义 ink，不在这里强行覆盖。
     */
    const INK_SCHEMES = [
      { key: "theme", label: "跟随配色", hint: "继承配色自带的墨色：Solarized 会带一点青灰，最贴近原设计" },
      { key: "deep", label: "深墨", hint: "比配色默认更深一档的暖青黑（#002b36，Solarized base03），保留配色气质，浅色下正文全部过 AA" },
      { key: "black", label: "纯黑", hint: "最大对比（#000）。强光或低视力更清楚，但大段正文会偏硬" },
    ];
    const INK_SCHEME_KEYS = INK_SCHEMES.map((s) => s.key);

    /* ==========================================================================
       配色主题：把江南泉《终端美学》三部曲里出现的色彩配置全部落地
       - 每个主题只声明「底色 / 正文 / 强调 / 状态色」这几个锚点，其余 token 由
         themeTokens() 按同一套规则推导（layer、border、hover、菜单材质、反白字…），保证 26 套
         主题的层级关系一致，不会每套各写一份 60 行 CSS；
       - tone 决定「文字墨色」是否可用，也决定 color-scheme；
       - solarized-light 保留手写的精确 token 块（原观感不动），其余走生成。
       ========================================================================== */
    const THEMES = [
      { key: "off", label: "Official · 官方配色", group: "官方", tone: "auto", note: "不使用叠加层，完全跟随官方主题" },

      /* —— 第一部：经典 CRT —— */
      { key: "green-phosphor", label: "P1 Green Phosphor · 绿磷光", group: "经典 CRT", tone: "dark",
        bg: "#020703", fg: "#33FF66", accent: "#76FF03", fgDim: "#1B5E20",
        error: "#FF5252", success: "#76FF03", warn: "#33FF66",
        note: "卡带未来主义：DEC VT220 / 避难所 Pip-Boy 的 P1 绿磷光" },
      { key: "amber-phosphor", label: "P3 Amber Phosphor · 琥珀光", group: "经典 CRT", tone: "dark",
        bg: "#070401", fg: "#FFB000", accent: "#FFD000", fgDim: "#B25900",
        error: "#FF5252", success: "#FFB000", warn: "#B25900",
        note: "80 年代大型机：590nm 琥珀光，暗光下最不刺眼的暖金黄" },
      { key: "matrix-rain", label: "Matrix Rain · 代码雨", group: "经典 CRT", tone: "dark",
        bg: "#030604", fg: "#00FF41", accent: "#C8FFD4", fgDim: "#008F11",
        error: "#FF5252", success: "#00FF41", warn: "#C8FFD4",
        note: "1999 黑客帝国：官方数字雨基准绿，头部白绿高亮" },
      { key: "cyberpunk-2077", label: "Cyberpunk 2077 · 夜之城", group: "经典 CRT", tone: "dark",
        bg: "#000000", fg: "#00F0FF", accent: "#FF006E", fgDim: "#00838F",
        error: "#FF006E", success: "#00FF9F", warn: "#FFE600",
        note: "赛博朋克 2077：电光青正文 + 霓虹粉强调 + 荧光绿状态" },
      { key: "radar-red", label: "Radar Red · 雷达血红", group: "经典 CRT", tone: "dark",
        bg: "#0A0304", fg: "#FF1744", accent: "#FF1744", fgDim: "#45151B",
        error: "#FF1744", success: "#FF5252", warn: "#FF1744",
        note: "冷战声纳屏：纯黑底、猩红战术字与暗血红边框" },
      { key: "weyland-corp", label: "Weyland Corp · 维兰重工", group: "经典 CRT", tone: "dark",
        bg: "#080B0C", fg: "#80CBC4", accent: "#FFA000", fgDim: "#37474F",
        error: "#FF5252", success: "#80CBC4", warn: "#FFA000",
        note: "异形 2 工业美学：冷灰绿底、青白信息与安全橙警告" },
      { key: "nerv-magi", label: "NERV MAGI · 三贤者", group: "经典 CRT", tone: "dark",
        bg: "#080503", fg: "#FF6D00", accent: "#7C4DFF", fgDim: "#4E342E",
        error: "#FF1744", success: "#FF6D00", warn: "#FF6D00",
        note: "EVA 三贤者：电光橙赤正文与决策紫点缀" },

      /* —— 第二部：纸面浅色 —— */
      { key: "p4-white", label: "P4 White · 纸白", group: "纸面浅色", tone: "light",
        bg: "#EEF3F8", bg1: "#E2EAF2", fg: "#10161D", fg2: "#3A4753", fg3: "#6B7A88",
        accent: "#2563EB", error: "#C62828", success: "#2E7D32", warn: "#B26A00",
        note: "Macintosh 128K / NeXTstation：微冷纸白底与致密油墨黑" },
      { key: "everforest-light", label: "Everforest Light · 绿色森林", group: "纸面浅色", tone: "light",
        bg: "#F8F5E4", bg1: "#EFEBD4", fg: "#5C6A72", fg2: "#708089", fg3: "#939F91",
        accent: "#8DA101", error: "#F85552", success: "#8DA101", warn: "#DFA000",
        note: "Sainnhe 自然主义：麦秸纸底、松石冷墨与苔藓绿高亮" },
      { key: "parchment-classic", label: "Parchment Classic · 羊皮纸", group: "纸面浅色", tone: "light",
        bg: "#F5E9DA", bg1: "#EADBC8", fg: "#3B3530", fg2: "#5A5148", fg3: "#8A7D6E",
        accent: "#A63D40", error: "#A63D40", success: "#5B7065", warn: "#8B5A2B",
        note: "中世纪手抄本：陈年羊皮卷与核桃铁胆墨水" },
      { key: "solarized-light", label: "Solarized Light · 暖羊皮纸", group: "纸面浅色", tone: "light",
        bg: "#FDF6E3", bg1: "#EEE8D5", bg2: "#E6DFC8", fg: "#586E75", fg2: "#657B83", fg3: "#93A1A1",
        accent: "#268BD2", error: "#DC322F", success: "#859900", warn: "#B58900",
        note: "Ethan Schoonover：CIELAB 感知测算的暖羊皮纸底" },
      { key: "catppuccin-latte", label: "Catppuccin Latte · 拿铁", group: "纸面浅色", tone: "light",
        bg: "#EFF1F5", bg1: "#E6E9EF", fg: "#4C4F69", fg2: "#5C5F77", fg3: "#8C8FA1",
        accent: "#8839EF", error: "#D20F39", success: "#40A02B", warn: "#DF8E1D",
        note: "Catppuccin Latte：奶白底与马卡龙低饱和粉彩" },

      /* —— 第三部：现代 —— */
      { key: "tokyo-night", label: "Tokyo Night · 东京夜", group: "现代", tone: "dark",
        bg: "#1A1B26", bg1: "#24283B", fg: "#C0CAF5", accent: "#7AA2F7",
        error: "#F7768E", success: "#9ECE6A", warn: "#E0AF68",
        note: "涩谷微雨：深蓝夜空底、冰蓝正文与珊瑚粉" },
      { key: "tokyo-night-day", label: "Tokyo Night Day · 东京白昼", group: "现代", tone: "light",
        // 原色 #3760BF 在 layer-1 #D5D7E0 上只有 4.08:1；压深 4% 到 #2F55B5 后才过 AA（4.74:1）。
        bg: "#E1E2E7", bg1: "#D5D7E0", fg: "#2F55B5", accent: "#2E7DE9",
        error: "#F52A65", success: "#587539", warn: "#8C6C3E",
        note: "Tokyo Night Day：晨雾冷灰纸白与深海群青墨" },
      { key: "kanagawa-wave", label: "Kanagawa Wave · 神奈川·浪", group: "现代", tone: "dark",
        bg: "#1F1F28", bg1: "#2A2A37", fg: "#DCD7BA", accent: "#7E9CD8",
        error: "#E46876", success: "#98BB6C", warn: "#E6C384",
        note: "葛饰北斋：古法油烟墨底与浪花白" },
      { key: "kanagawa-lotus", label: "Kanagawa Lotus · 神奈川·莲", group: "现代", tone: "light",
        bg: "#F2ECBC", bg1: "#E5DDAD", fg: "#545464", accent: "#E46876",
        error: "#D7474B", success: "#6F894E", warn: "#77713F",
        note: "Kanagawa Lotus：陈年古和纸底与出水荷粉" },
      { key: "rose-pine", label: "Rosé Pine · 玫瑰松木", group: "现代", tone: "dark",
        bg: "#191724", bg1: "#1F1D2E", fg: "#E0DEF4", accent: "#EBBCBA",
        error: "#EB6F92", success: "#9CCFD8", warn: "#F6C177",
        note: "Soho 黑胶店：松针暗紫底与晒旧干玫瑰" },
      { key: "rose-pine-dawn", label: "Rosé Pine Dawn · 玫瑰晨光", group: "现代", tone: "light",
        bg: "#FAF4ED", bg1: "#F2E9E1", fg: "#575279", accent: "#D7827E",
        error: "#B4637A", success: "#56949F", warn: "#EA9D34",
        note: "Rosé Pine Dawn：漂白亚麻暖底与梅子紫灰正文" },
      { key: "catppuccin-mocha", label: "Catppuccin Mocha · 摩卡", group: "现代", tone: "dark",
        bg: "#1E1E2E", bg1: "#313244", fg: "#CDD6F4", accent: "#CBA6F7",
        error: "#F38BA8", success: "#A6E3A1", warn: "#F9E2AF",
        note: "Catppuccin Mocha：深紫黑底与薰衣草淡紫" },

      /* —— 第三部：AI 品牌 —— */
      { key: "claude-light", label: "Claude Light · 书斋浅", group: "AI 品牌", tone: "light",
        bg: "#FAF6F0", bg1: "#F0EAE1", fg: "#2C2B29", accent: "#D97757",
        error: "#B3261E", success: "#3F7A55", warn: "#A66A1F",
        note: "Anthropic 人文书斋：羊皮纸底与陶土赤红" },
      { key: "claude-dark", label: "Claude Dark · 书斋深", group: "AI 品牌", tone: "dark",
        bg: "#1E1B18", bg1: "#2A2622", fg: "#EAE5DE", accent: "#D97757",
        error: "#E07A5F", success: "#7FA98A", warn: "#D9A05B",
        note: "Anthropic 意式浓缩黑：暖炭底与陶土赤红" },
      { key: "openai-light", label: "OpenAI Light · 涌现浅", group: "AI 品牌", tone: "light",
        bg: "#F7F7F8", bg1: "#ECECF1", fg: "#202123", accent: "#10A37F",
        error: "#C0392B", success: "#10A37F", warn: "#B7791F",
        note: "纯白实验室：极简灰底与生命薄荷青" },
      { key: "openai-dark", label: "OpenAI Dark · 涌现深", group: "AI 品牌", tone: "dark",
        bg: "#0D0D0D", bg1: "#1A1A1A", fg: "#ECECF1", accent: "#10A37F",
        error: "#E06C75", success: "#10A37F", warn: "#D19A66",
        note: "极简冷黑画布：薄荷涌现绿作为唯一强调" },
      { key: "gemini-light", label: "Gemini Light · 极光浅", group: "AI 品牌", tone: "light",
        bg: "#F0F4F9", bg1: "#E4EAF2", fg: "#1F1F1F", accent: "#1A73E8",
        error: "#D93025", success: "#188038", warn: "#B06000",
        note: "高分子云白：科技蓝点缀的 Material You 底色" },
      { key: "gemini-dark", label: "Gemini Dark · 极光深", group: "AI 品牌", tone: "dark",
        bg: "#131314", bg1: "#1E1E20", fg: "#E3E3E3", accent: "#7C75FA",
        error: "#F28B82", success: "#81C995", warn: "#FDD663",
        note: "深空炭黑：由科技蓝流向深空紫的极光点缀" },
    ];
    const THEME_KEYS = THEMES.map((t) => t.key);
    const THEME_MAP = new Map(THEMES.map((t) => [t.key, t]));
    const THEME_TONES = Object.fromEntries(THEMES.map((t) => [t.key, t.tone]));
    const DEFAULT_THEME = "solarized-light";

    /* 颜色小工具：只在构建 CSS 时跑一次，不引入依赖。 */
    const hexRgb = (hex) => {
      const n = parseInt(hex.slice(1), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const rgbHex = (r, g, b) => "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
    /** t=0 全取 a，t=1 全取 b。 */
    const mix = (a, b, t) => {
      const A = hexRgb(a), B = hexRgb(b);
      return rgbHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
    };
    const alpha = (hex, a) => {
      const [r, g, b] = hexRgb(hex);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    };
    /**
     * 半透明「材质」填充：按 target 面与 backdrop 底色反解色值，用 a 合成后正好落回 target。
     * 0.2.x 官方公共菜单（MenuSurface）的 --dsw-menu-surface-fill 是玻璃层：macOS 用
     * bg-base 做 opaque backing，其余平台直接盖在模糊后的页面上。主题若把 bg1 原样当
     * 填充色，合成结果会被 backdrop 稀释，层级就跑偏；反解后合成结果稳定等于本主题的
     * raised 面（layer-1），浅深两套层级关系与官方一致。
     */
    const glassFill = (target, backdrop, a) => {
      const T = hexRgb(target), B = hexRgb(backdrop);
      const ch = (i) => Math.max(0, Math.min(255, Math.round((T[i] - (1 - a) * B[i]) / a)));
      return `rgba(${ch(0)}, ${ch(1)}, ${ch(2)}, ${a})`;
    };
    const luminance = (hex) => {
      const [r, g, b] = hexRgb(hex).map((v) => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    /** 强调色上的反白字：亮底用黑、暗底用白。 */
    const onColor = (hex) => (luminance(hex) > 0.45 ? "#000000" : "#FFFFFF");
    /** 两色的 WCAG 对比度（1~21）。 */
    const contrast = (a, b) => {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    /**
     * 可读性兜底：文字色对底色不足 minRatio 时，朝黑/白逐步收（每步 8%，最多 12 步）。
     * 用于 link / 深潜标签这类「取 accent 但必须可读」的 token —— 浅色主题里 accent
     * 可能是粉彩（对暖底只有 2~3:1），深色主题里 accent 也可能偏暗。
     */
    const readable = (hex, backdrop, minRatio) => {
      if (contrast(hex, backdrop) >= minRatio) return hex;
      const target = luminance(backdrop) > 0.5 ? "#000000" : "#FFFFFF";
      let out = hex;
      for (let step = 1; step <= 12; step++) {
        out = mix(hex, target, step * 0.08);
        if (contrast(out, backdrop) >= minRatio) return out;
      }
      return out;
    };

    /** 从少量锚点推导整套 alias / specific token。 */
    function themeTokens(t) {
      const dark = t.tone === "dark";
      const bg = t.bg;
      const bg1 = t.bg1 || mix(bg, dark ? "#FFFFFF" : "#000000", dark ? 0.07 : 0.05);
      const bg2 = t.bg2 || mix(bg, dark ? "#FFFFFF" : "#000000", dark ? 0.13 : 0.10);
      const fg = t.fg;
      const fg2 = t.fg2 || mix(fg, bg, 0.20);
      const fg3 = t.fg3 || mix(fg, bg, 0.48);
      const fgDim = t.fgDim || mix(fg, bg, 0.68);
      const fgStrong = t.fgStrong || mix(fg, dark ? "#FFFFFF" : "#000000", 0.30);
      const accent = t.accent;
      const accentHover = mix(accent, dark ? "#FFFFFF" : "#000000", 0.14);
      const border1 = mix(bg, fg, 0.08);
      const border2 = t.border2 || mix(bg, fg, 0.18);
      const border3 = mix(bg, fg, 0.26);
      const border4 = mix(bg, fg, 0.34);
      const error = t.error || (dark ? "#FF6B6B" : "#C62828");
      const success = t.success || (dark ? "#7BD88F" : "#2E7D32");
      const warn = t.warn || (dark ? "#E6C384" : "#A66A1F");
      const hover = mix(bg, accent, 0.10);
      const hoverSolid = mix(bg, accent, 0.14);
      const active = mix(bg, accent, 0.22);
      const scroll = mix(bg, fg, 0.14);
      /* —— 0.2.x 公共菜单材质（MenuSurface）——
         官方把菜单底从 --dsw-specific-menu 换成了新的 --dsw-menu-surface-fill：
         浅色 58% / 深色 45% 的玻璃填充 + backdrop blur，macOS 另铺一层 bg-base 做
         opaque backing；菜单图标吃 --dsw-alias-menu-icon（深色档 = label-primary-dimmed），
         吸顶分组标题用 94% 的 --dsw-alias-menu-group-header-fill。
         本层不接管官方主题偏好（官方 ui-theme 仍是 light/dark/system），所以这四个
         token 一旦漏掉，深色主题会直接继承官方浅色值：菜单底 = #f8f9fa94 的近白玻璃，
         图标 = 深色 #353638，在深色页面上就是「一块刺眼的白板 + 看不见的图标」。
         推导规则：玻璃按「合成后 = 本主题 layer-1」反解；图标/暗档文字按官方相同的
         方向从 fg 往 bg 收（深色收得少、浅色收得多）。 */
      const labelPrimaryDimmed = mix(fg, bg, dark ? 0.06 : 0.03);
      const menuSurface = glassFill(bg1, bg, dark ? 0.45 : 0.58);
      const menuHeader = glassFill(bg1, bg, 0.94);
      const menuIcon = dark ? labelPrimaryDimmed : mix(fg, bg, 0.16);
      /* —— 官方 0.2.x 主题新增 token 全量接管 ——
         这批（文档预览 / diff / 状态色阶 / 遮罩 / tooltip·toast / 反白标签 / 轨迹品牌色…）
         是 0.2.x 才进主题表的；不接管时非官方主题会落回官方当前偏好的值。官方偏好是
         浅色时，深色主题里就会出现浅色 diff 底、浅色文档画布、深色图标、不可见的反白字。
         推导沿用官方关系（state 三级 = 底色混状态色；diff 底 = 更淡的混色；反白标签 =
         与主文字对立的对比色；link / 深潜 = accent 经可读性兜底），不改变官方 token
         的语义，只换成本主题的色相。 */
      const link = readable(accent, bg, 4.5);
      const deepDiving = readable(accent, bg, 4.5);
      const deepDivingShimmer = mix(deepDiving, dark ? "#FFFFFF" : "#000000", dark ? 0.45 : 0.30);
      const primaryInverted = dark ? bg1 : mix(bg, "#FFFFFF", 0.92);
      const bluishPrimary = dark ? fg : readable(mix(fg, accent, 0.30), mix(bg, accent, 0.10), 4.5);
      const toastBg = dark ? bg2 : mix(fg, "#000000", 0.30);
      const tooltipBg = dark ? mix(bg, fg, 0.20) : mix(fg, "#000000", 0.30);
      const idleState = mix(bg, fg, dark ? 0.30 : 0.17);
      /* 文档预览是中性画布（深色 = bg / 浅色 = layer-1），预览栏文字要在这个面上过 AA */
      const docPreviewBg = dark ? bg : bg1;
      const docPreviewLabel = readable(fg2, docPreviewBg, 4.5);
      const tint = (state, ratio) => mix(bg, state, ratio);
      return {
        "--dsw-alias-bg-base": bg,
        "--dsw-alias-bg-layer-1": bg1,
        "--dsw-alias-bg-layer-2": bg2,
        "--dsw-alias-bg-layer-3": bg1,
        "--dsw-alias-bg-overlay": bg1,
        "--dsw-alias-bg-module-platform": bg1,
        "--dsw-alias-bg-multi-select": bg1,
        "--dsw-alias-bg-skeleton": alpha(fg, 0.08),
        "--dsw-alias-border-l1": border1,
        "--dsw-alias-border-l2": border2,
        "--dsw-alias-border-l3": border3,
        "--dsw-alias-border-l4": border4,
        "--dsw-alias-border-inverted": mix(bg, accent, 0.45),
        "--dsw-alias-border-l2-darkmode-thin": border2,
        "--dsw-alias-brand-primary": accent,
        "--dsw-alias-label-primary": fg,
        "--dsw-alias-label-secondary": fg2,
        "--dsw-alias-label-tertiary": fg3,
        "--dsw-alias-label-caption": fg3,
        "--dsw-alias-label-dimmed": fgDim,
        "--dsw-alias-label-primary-dimmed": labelPrimaryDimmed,
        "--dsw-alias-label-primary-foreground": onColor(accent),
        "--dshx-on-accent": onColor(accent),
        "--dsw-alias-state-error-primary": error,
        "--dsw-alias-state-success-primary": success,
        "--dsw-alias-state-warn-primary": warn,
        "--dsw-specific-sidebar-fill": bg1,
        "--dsw-specific-menu": bg1,
        "--dsw-specific-input-major": bg2,
        "--dsw-specific-login-input": bg2,
        "--dsw-specific-tip": bg1,
        "--dsw-specific-selector": bg1,
        "--dsw-specific-bubble": bg1,
        "--dsw-specific-bubble-highlight": bg2,
        "--dsw-specific-sidebar-nav-item-active": bg1,
        "--dsw-specific-sidebar-nav-item-hover": bg2,
        "--dsw-specific-sidebar-nav-item-active-accent": bg2,
        /* 公共菜单材质（0.2.x MenuSurface）：见上方推导注释 */
        "--dsw-menu-surface-fill": menuSurface,
        "--dsw-alias-menu-group-header-fill": menuHeader,
        "--dsw-alias-menu-icon": menuIcon,
        "--dsw-alias-markdown-code-block": bg1,
        "--dsw-alias-markdown-code-block-banner": bg2,
        "--dsw-alias-markdown-code-segment-selected": bg,
        "--dsw-alias-markdown-code-segment-unselected": bg2,
        "--dsw-alias-markdown-inline-code": bg2,
        "--dsw-alias-markdown-citation": bg2,
        "--dsw-alias-markdown-placeholder": bg2,
        "--dsw-alias-markdown-tag": bg2,
        "--dsw-alias-interactive-bg-hover": hover,
        "--dsw-alias-interactive-bg-hover-solid": hoverSolid,
        "--dsw-alias-interactive-bg-active": active,
        "--dsw-alias-interactive-bg-hover-accent": mix(bg, accent, 0.12),
        "--dsw-alias-interactive-bg-hover-danger": alpha(error, 0.10),
        "--dsw-alias-button-primary-fill": accent,
        "--dsw-alias-button-primary-hover": accentHover,
        "--dsw-alias-button-primary-dimmed": bg2,
        "--dsw-alias-button-info-fill": accent,
        "--dsw-alias-button-info-hover": accentHover,
        "--dsw-alias-button-contrast-fill": fgStrong,
        "--dsw-alias-button-floating-fill": bg,
        "--dsw-alias-button-floating-hover": bg1,
        "--dsw-alias-button-elevated-fill": bg,
        "--dsw-alias-button-ghost-active-fill": bg1,
        "--dsw-alias-button-ghost-active-border": border2,
        "--dsw-alias-button-ghost-active-hover": bg2,
        "--dsw-alias-scrollbar-bg-l1": scroll,
        "--dsw-alias-scrollbar-bg-l2": scroll,
        "--dsw-alias-scrollbar-hover-l1": mix(bg, fg, 0.26),
        "--dsw-alias-scrollbar-hover-l2": mix(bg, fg, 0.26),
        /* —— 官方 0.2.x 新增 token（推导见上方注释）—— */
        /* 文档预览 */
        "--dsw-alias-bg-document-preview": docPreviewBg,
        "--dsw-alias-bg-document-selection": "color-mix(in srgb, #3B82F6 40%, transparent)",
        "--dsw-alias-label-document-preview": docPreviewLabel,
        /* 遮罩：中性黑/白层，按 tone 取官方同档不透明度 */
        "--dsw-alias-bg-mask-1": dark ? "#00000080" : "#0000003d",
        "--dsw-alias-bg-mask-2": dark ? "#00000033" : "#0000001f",
        "--dsw-alias-bg-mask-3": "#0000007a",
        "--dsw-alias-bg-mask-photo": "#000000e0",
        "--dsw-alias-bg-mask-drop": dark ? alpha(mix(bg, fg, 0.10), 0.70) : alpha(mix(bg, "#FFFFFF", 0.86), 0.70),
        /* 边框 / 品牌 */
        "--dsw-alias-border-inverted2": dark ? alpha(fg, 0.10) : "#00000000",
        "--dsw-alias-brand-primary-invert": onColor(accent),
        "--dsw-alias-brand-primary-new-colorprimary-new-color": accent,
        "--dsw-alias-brand-text": fg,
        /* 工具栏按钮：官方浅深两档本来就是同一组中性半透明，保持官方常量 */
        "--dsw-alias-button-tool-bar-fill": "#54555780",
        "--dsw-alias-button-tool-bar-hover": "#54555799",
        "--dsw-alias-button-tool-bar-fill-invisible": "#1f1f1f5c",
        /* 文字：深潜 / 反白 / bluish / 扫光 */
        "--dsw-alias-label-deep-diving": deepDiving,
        "--dsw-alias-label-deep-diving-shimmer": deepDivingShimmer,
        "--dsw-alias-label-primary-bluish": bluishPrimary,
        "--dsw-alias-label-primary-inverted": primaryInverted,
        "--dsw-alias-label-shimmer": alpha(dark ? "#FFFFFF" : "#000000", dark ? 0.45 : 0.30),
        "--dsw-alias-link": link,
        /* 语义状态色阶：三级 = 底色混状态色（官方为浅色/深色定制过的同位置色阶） */
        "--dsw-alias-state-business-primary": accent,
        "--dsw-alias-state-business-tertiary": tint(accent, dark ? 0.16 : 0.10),
        "--dsw-alias-state-error-secondary": dark ? error : mix(error, "#FFFFFF", 0.18),
        "--dsw-alias-state-success-secondary": dark ? success : mix(success, "#FFFFFF", 0.18),
        "--dsw-alias-state-warn-secondary": dark ? warn : mix(warn, "#FFFFFF", 0.18),
        "--dsw-alias-state-warn-label": warn,
        "--dsw-alias-state-success-tertiary": tint(success, dark ? 0.16 : 0.10),
        "--dsw-alias-state-warn-tertiary": tint(warn, dark ? 0.16 : 0.10),
        "--dsw-alias-state-idle-primary": idleState,
        /* 代码 / 文件 diff */
        "--dsw-alias-code-diff-added": alpha(success, dark ? 0.12 : 0.08),
        "--dsw-alias-code-diff-deleted": alpha(error, dark ? 0.12 : 0.08),
        "--dsw-alias-file-diff-added-bg": tint(success, dark ? 0.16 : 0.10),
        "--dsw-alias-file-diff-added-gutter": tint(success, dark ? 0.08 : 0.05),
        "--dsw-alias-file-diff-added-marker": dark ? mix(success, "#FFFFFF", 0.12) : mix(success, "#000000", 0.22),
        "--dsw-alias-file-diff-deleted-bg": tint(error, dark ? 0.16 : 0.10),
        "--dsw-alias-file-diff-deleted-gutter": tint(error, dark ? 0.08 : 0.05),
        "--dsw-alias-file-diff-deleted-marker": dark ? mix(error, "#FFFFFF", 0.12) : mix(error, "#000000", 0.22),
        /* 开关滑块 / 浮层 / 轮次触发 */
        "--dsw-alias-switch-thumb": dark ? mix(fg, bg, 0.20) : mix(bg, "#FFFFFF", 0.92),
        "--dsw-alias-toast-bg": toastBg,
        "--dsw-alias-toast-label": "#FFFFFF",
        "--dsw-alias-tooltip-bg": tooltipBg,
        "--dsw-alias-tooltip-key-bg": "color-mix(in srgb, var(--dsw-alias-tooltip-bg), #FFFFFF 18%)",
        "--dsw-alias-turn-trigger-bg": dark ? hover : bg1,
        "--dsw-alias-turn-trigger-bg-hover": dark ? active : hover,
        "--dsw-static-neutral-50": bg1,
        "--dsw-static-neutral-100": bg2,
      };
    }

    /**
     * 生成每个主题的 CSS 块。
     * solarized-light 不在这里生成：它保留原手写块，逐 token 精调过，观感不能动。
     */
    const THEME_CSS = THEMES.filter((t) => t.key !== "off" && t.key !== "solarized-light").map((t) => {
      const vars = Object.entries(themeTokens(t)).map(([k, v]) => `        ${k}: ${v} !important;`).join("\n");
      return `
      html[data-dsh-ux="on"][data-dsh-ux-theme="${t.key}"] { color-scheme: ${t.tone}; }
      html[data-dsh-ux="on"][data-dsh-ux-theme="${t.key}"] body {
        background: ${t.bg} !important;
        color: ${t.fg} !important;
${vars}
      }
      html[data-platform="darwin"][data-dsh-ux="on"][data-dsh-ux-theme="${t.key}"] body div:has(> [data-slot="sidebar"]) {
        background: ${t.bg1 || mix(t.bg, t.tone === "dark" ? "#FFFFFF" : "#000000", t.tone === "dark" ? 0.07 : 0.05)} !important;
      }`;
    }).join("\n");

    /** 枚举键 → 允许的值（与 lib/index.js 的 ENUM_KEYS 必须同集合，首帧脚本按它校验）。 */
    const ENUM_KEYS = {
      theme: THEME_KEYS,
      font: FONT_SCHEME_KEYS,
      fontweight: FONT_WEIGHT_KEYS,
      ink: INK_SCHEME_KEYS,
    };

    // 默认值对齐设置页的「推荐」徽标：字重 semiBold、墨色 deep（跟随时才用配色自带墨色）。
    // diag 不再是用户开关：折叠引擎稳定后它只会在控制台刷噪声；排查时在 URL 加 ?dsh-ux-diag=1。
    // rev 用来做一次性迁移：1.7.x 的旧默认（跟随配色 + 标准）在 1.8 首次加载时抬到推荐档。
    const CONFIG_REV = 2;
    const DEFAULT_STATE = { rev: CONFIG_REV, master: true, theme: DEFAULT_THEME, font: "auto", fontweight: "semibold", ink: "deep", layout: true, fold: true, usage: true, quietnew: false };
    const CONFIG_COOKIE = "dsh-uxexo-config";
    /** 改名前（dsh-enhance 1.9.x 及更早）的配置键：只读一次用于迁移，绝不写入。 */
    const LEGACY_CONFIG_COOKIE = "dsh-enhance-config";
    /** 1.7.x 的单键配色开关，比 LEGACY_CONFIG_COOKIE 更早，同样只读。 */
    const LEGACY_THEME_COOKIE = "dsh-enhance-theme";
    /** 仓库地址：设置页顶部的 Star 入口用它（部署镜像可在这里改）。 */
    const REPO_URL = "https://github.com/jiangnanquan/dsh-uxexo";
    /** 诊断日志不再是用户开关；排查折叠问题时在 URL 上带 ?dsh-ux-diag=1 即可。 */
    const DIAG_ON = (() => {
      try {
        return typeof location !== "undefined" && new URLSearchParams(location.search).get("dsh-ux-diag") === "1";
      } catch (_) {
        return false;
      }
    })();

    const CSS = `
      /* ==========================================================================
         1) 功能闸门（html[data-dsh-ux-*]）—— 全部由配置开关驱动，改属性即生效
         ========================================================================== */

      /* ---- 布局微调：闸门 html[data-dsh-ux-layout="on"] ---- */
      html[data-dsh-ux-layout="on"],
      html[data-dsh-ux-layout="on"] body {
        overscroll-behavior: none;
        overscroll-behavior-block: none;
      }
      html[data-dsh-ux-layout="on"] * {
        --dsh-chat-content-width: 94% !important;
      }
      html[data-dsh-ux-layout="on"] [data-chat-flow] {
        gap: 8px !important;
      }
      html[data-dsh-ux-layout="on"] [data-slot="conversation.input.dock"] > div {
        max-width: var(--dsh-chat-content-width) !important;
      }
      /* 新对话（hero 相位）顶部那行「文件夹 chip + 模式 chip」要和下面的输入卡片同列。
         官方几何：文件夹图标落在卡片左边缘内侧 12px，与卡片里的占位文字、＋按钮同一列
         （行 padding-left 20px、chip 自身 padding 8px、卡片根容器 padding 16px）。
         官方之所以稳，是因为 --dsh-chat-content-width 是绝对值（clamp 出来的 px），
         卡片 max-width = 它 + 32px 正好等于卡片根容器的内容盒宽度 —— 卡片永远铺满、
         不会被居中。本层把它接管成 94%（百分比按「每个元素各自的包含块」解析）之后，
         卡片的 max-width(94% + 32px) 比根容器内容盒窄，又被根容器的 align-items:center
         居中，于是卡片左边缘相对 chip 一路右移：窗口越宽差得越多（2400px 宽约 33px、
         2560px 宽约 37px），看上去就是 chip 偏左、跟卡片对不上。
         修法：hero 相位下让卡片直接铺满根容器（宽度 = 行宽 - 32px），图标回到卡片左边缘
         内侧 12px，与官方一致。只改 hero —— active 相位没有这一行 chip、本来就不偏，而且
         卡片与附件坞（AttachmentsDock 也吃这个变量）都保持原样，不影响已有会话的观感。 */
      html[data-dsh-ux-layout="on"] [data-content-phase="hero"] [data-composer-card] {
        --dsh-composer-card-max-width: 100% !important;
      }
      /* 输入框的 / @ 候选菜单（技能、指令、文件）里每行的说明文字贴右边缘：
         官方 ._itemDescription{text-align:right;flex:1;…}。行宽一宽，短说明就整块
         飘到右侧、只剩中间一截，看着像"居中"。这里改成紧跟名称/别名左对齐，一列读下来
         才整齐。data-trigger-menu 是官方给这层菜单的稳定标记（子项另带
         data-source=skill / 指令），类名只取 CSS Module 的局部名后缀 _itemDescription，
         不绑每次构建都会变的哈希前缀。 */
      html[data-dsh-ux-layout="on"] [data-trigger-menu] [class*="_itemDescription"] {
        text-align: left !important;
      }

      /* ---- dsh-uxexo 配色：Solarized 浅色叠加层，闸门 html[data-dsh-ux-theme="solarized-light"] ----
         它不接管官方主题偏好 —— 官方 settings 的 ui-theme 段只接受 light/dark/system
         （第三方主题存不进去，且 ThemeRuntime.adopt 会把内存偏好覆盖回内置值），
         所以本层自己带开关：html 属性由 host 在 index 注入的脚本按 cookie 在首帧前定好。
         这一块是唯一手写 token 的主题（逐色精调过）；其余主题由 THEME_CSS 按锚点生成。 */
      html[data-dsh-ux="on"][data-dsh-ux-theme="solarized-light"] { color-scheme: light; }
      html[data-dsh-ux="on"][data-dsh-ux-theme="solarized-light"] body {
        /* —— alias 层：基础面 / 文字 / 边框 —— */
        --dsw-alias-bg-base: #fdf6e3 !important;
        --dsw-alias-bg-layer-1: #eee8d5 !important;
        --dsw-alias-bg-layer-2: #e6dfc8 !important;
        --dsw-alias-bg-layer-3: #eee8d5 !important;
        --dsw-alias-bg-overlay: #eee8d5 !important;
        --dsw-alias-bg-module-platform: #eee8d5 !important;
        --dsw-alias-bg-multi-select: #eee8d5 !important;
        --dsw-alias-bg-skeleton: rgba(88, 110, 117, 0.08) !important;
        --dsw-alias-border-l1: #e4dcc4 !important;
        --dsw-alias-border-l2: #c9bfa4 !important;
        --dsw-alias-border-l3: #cdc4a3 !important;
        --dsw-alias-border-l4: #b8ae8e !important;
        --dsw-alias-border-inverted: #d3af86 !important;
        --dsw-alias-border-l2-darkmode-thin: #c9bfa4 !important;
        --dsw-alias-brand-primary: #268bd2 !important;
        --dshx-on-accent: #fdf6e3 !important;
        --dsw-alias-label-primary: #586e75 !important;
        --dsw-alias-label-secondary: #657b83 !important;
        --dsw-alias-label-tertiary: #93a1a1 !important;
        --dsw-alias-label-caption: #93a1a1 !important;
        --dsw-alias-label-dimmed: #cdc4a3 !important;
        --dsw-alias-label-primary-dimmed: #5d7278 !important;
        --dsw-alias-state-error-primary: #dc322f !important;
        --dsw-alias-state-success-primary: #859900 !important;
        --dsw-alias-state-warn-primary: #b58900 !important;
        /* —— specific 层：菜单 / 输入 / 气泡 / 侧边栏 —— */
        --dsw-specific-sidebar-fill: #eee8d5 !important;
        --dsw-specific-menu: #eee8d5 !important;
        --dsw-specific-input-major: #ddd6c1 !important;
        --dsw-specific-login-input: #ddd6c1 !important;
        --dsw-specific-tip: #eee8d5 !important;
        /* 公共菜单材质（0.2.x MenuSurface）：与生成主题同一套关系。
           玻璃填充按「合成后 = layer-1 #eee8d5」反解（58%），吸顶标题 94%，
           菜单图标按浅色档从正文 #586e75 往底 #fdf6e3 收 16%。 */
        --dsw-menu-surface-fill: rgba(227, 222, 203, 0.58) !important;
        --dsw-alias-menu-group-header-fill: rgba(237, 231, 212, 0.94) !important;
        --dsw-alias-menu-icon: #728487 !important;
        --dsw-specific-selector: #eee8d5 !important;
        --dsw-specific-bubble: #eee8d5 !important;
        --dsw-specific-bubble-highlight: #e4dcc4 !important;
        --dsw-specific-sidebar-nav-item-active: #eee8d5 !important;
        --dsw-specific-sidebar-nav-item-hover: #e6dfc8 !important;
        --dsw-specific-sidebar-nav-item-active-accent: #e6dfc8 !important;
        /* —— markdown 面：代码块 / 行内代码 / 引用 —— */
        --dsw-alias-markdown-code-block: #eee8d5 !important;
        --dsw-alias-markdown-code-block-banner: #e6dfc8 !important;
        --dsw-alias-markdown-code-segment-selected: #fdf6e3 !important;
        --dsw-alias-markdown-code-segment-unselected: #e6dfc8 !important;
        --dsw-alias-markdown-inline-code: #e6dfc8 !important;
        --dsw-alias-markdown-citation: #e6dfc8 !important;
        --dsw-alias-markdown-placeholder: #e6dfc8 !important;
        --dsw-alias-markdown-tag: #e6dfc8 !important;
        /* —— 交互态 / 按钮 —— */
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
        --dsw-alias-button-ghost-active-hover: #e6dfc8 !important;
        /* —— 浮层 / 滚动条 —— */
        --dsw-alias-tooltip-bg: #073642 !important;
        --dsw-alias-toast-bg: #073642 !important;
        --dsw-hovercard-bg: #073642 !important;
        --dsw-alias-scrollbar-bg-l1: #d8d0b2 !important;
        --dsw-alias-scrollbar-bg-l2: #d8d0b2 !important;
        --dsw-alias-scrollbar-hover-l1: #c9bfa4 !important;
        --dsw-alias-scrollbar-hover-l2: #c9bfa4 !important;
        /* —— 静态层：present/交付卡片的文件行不吃 alias 层，它用包内变量
           --deliverable-fill: var(--dsw-static-neutral-50)（亮色是冷白 #fafafa，
           在奶油底上就是一块"留白"）。该静态 token 全官方只有 2 个消费者
           （本卡片 + 已覆盖的 markdown 行内代码），-100 只有 1 个（卡片 hover）。 */
        --dsw-static-neutral-50: #eee8d5 !important;
        --dsw-static-neutral-100: #e6dfc8 !important;
      }
      /* 官方桌面版（macOS）的左栏是「原生毛玻璃 + 四成侧边色」的半透明层，不是纯色：
         ui-layout 在 darwin 下单独写了
           ._sidebarCol{background:linear-gradient(…), color-mix(in srgb,
             color-mix(in srgb, var(--dsw-specific-sidebar-fill) 97%, #7a9bf0) 40%, transparent)}
         而 Electron 窗口是 transparent + vibrancy:"sidebar"，web-frontend 又把
         html[data-platform=darwin]（含 body）置成 background:transparent，
         于是剩下六成原生灰材料透上来。实测：那四成奶油压在原生冷灰上得到 #d3d5cf 左右，
         紧挨着右栏不透明的 Solarized 奶油底 #fdf6e3 —— 就是「左侧变深色、配色对不上」。
         非 darwin（含桌面版之前的 Web 版）左栏本来就吃
           ._sidebarCol{background:var(--dsw-specific-sidebar-fill)}
         本层只把 darwin 这一层拉回同色，左栏回到改造前的 #eee8d5。
         选中用插槽锚点：ui-renderer 的 SlotOutlet 固定输出 div[data-slot="sidebar"]
         （display:contents 不产生盒子，:has() 按 DOM 关系匹配），不去写 CSS Module 的
         哈希类名 —— 0.1.5 与 0.2.0 哈希本就不同，写死下次升级就失效。
         只在 Solarized 开启且浅色时生效；关掉插件配色即回到官方毛玻璃观感。 */
      html[data-platform="darwin"][data-dsh-ux="on"][data-dsh-ux-theme="solarized-light"] body div:has(> [data-slot="sidebar"]) {
        background: var(--dsw-specific-sidebar-fill) !important;
      }
${THEME_CSS}

      /* ---- 公共菜单（0.2.x MenuSurface）内的交互底色重绑 ----
         菜单材质是浮在 layer-1 上的玻璃面，而本层全局的 hover/active 是「base 底色 +
         accent」——直接落在 layer-1 上几乎同色，菜单里的选中行/悬停行会看不见。
         官方用 white/black 半透明 overlay 解决；这里保持本层的 accent 关系，把底色换成
         layer-1 再兑 accent，选中/悬停重新可见。[data-menu-material] 是官方 MenuSurface
         的稳定标记（材质 div 与内容同在其下），主题升级哈希类名变化也不受影响。 */
      html[data-dsh-ux="on"]:not([data-dsh-ux-theme-tone="auto"]) [data-menu-material] {
        --dsw-alias-interactive-bg-hover: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 84%, var(--dsw-alias-brand-primary) 16%);
        --dsw-alias-interactive-bg-hover-solid: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 78%, var(--dsw-alias-brand-primary) 22%);
        --dsw-alias-interactive-bg-active: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 74%, var(--dsw-alias-brand-primary) 26%);
        /* 菜单底部「还有内容」的渐隐用的是 --dsw-specific-menu；本层把它设成不透明
           layer-1，落在半透明玻璃材质上会切出一道色差，这里跟随菜单材质。 */
        --dsw-specific-menu: var(--dsw-menu-surface-fill);
      }

      /* ---- 文字墨色：闸门 html[data-dsh-ux-ink] ----
         与配色层解耦：配色决定「底」，这里只决定「字」。全部作用于浅色 —— 深色配色
         各自定义 ink，不在这里强行覆盖。跟随配色（theme）不写任何规则，直接继承配色层。
         档位梯度保持：primary > secondary > tertiary > caption > dimmed，不能只压 primary，
         否则会变成「标题黑了、正文还是灰的」，比默认更乱。 */
      html[data-dsh-ux="on"][data-dsh-ux-ink="deep"]:not([data-dsh-ux-theme-tone="dark"]) body:not([data-ds-dark-theme]),
      html[data-dsh-ux="on"][data-dsh-ux-theme-tone="light"][data-dsh-ux-ink="deep"] body {
        --dsw-alias-label-primary: #002b36 !important;
        --dsw-alias-label-secondary: #073642 !important;
        --dsw-alias-label-tertiary: #586e75 !important;
        --dsw-alias-label-caption: #657b83 !important;
        --dsw-alias-label-dimmed: #93a1a1 !important;
      }
      html[data-dsh-ux="on"][data-dsh-ux-ink="black"]:not([data-dsh-ux-theme-tone="dark"]) body:not([data-ds-dark-theme]),
      html[data-dsh-ux="on"][data-dsh-ux-theme-tone="light"][data-dsh-ux-ink="black"] body {
        --dsw-alias-label-primary: #000000 !important;
        --dsw-alias-label-secondary: #1a1a1a !important;
        --dsw-alias-label-tertiary: #3d3d3d !important;
        --dsw-alias-label-caption: #4f4f4f !important;
        --dsw-alias-label-dimmed: #8a8a8a !important;
      }

      /* ---- 主题强调色：发送/停止按钮 + 侧栏「新会话」 ----
         官方 CSS 里这两个按钮分别吃 --dsw-alias-button-info-fill / button-elevated-fill，
         在部分主题与 darwin 毛玻璃规则下会脱离第三个锚点色 accent。这里统一绑定
         --dsw-alias-brand-primary，并把反白字换成每套主题算好的 --dshx-on-accent。
         「新会话」默认跟随主题色；quietnew 打开后改用只比侧栏底色略深的弱化样式。 */
      html[data-dsh-ux="on"] [data-slot="conversation.composer"] button[class*="_primary"] {
        background: var(--dsw-alias-brand-primary) !important;
        color: var(--dshx-on-accent, #FFFFFF) !important;
      }
      html[data-dsh-ux="on"] [data-slot="conversation.composer"] button[class*="_primary"]:hover:not(:disabled) {
        background: var(--dsw-alias-button-info-hover) !important;
      }
      html[data-dsh-ux="on"] [data-slot="sidebar"] button[class*="_newSession"] {
        background: var(--dsw-alias-brand-primary) !important;
        border-color: var(--dsw-alias-brand-primary) !important;
        color: var(--dshx-on-accent, #FFFFFF) !important;
      }
      html[data-dsh-ux="on"] [data-slot="sidebar"] button[class*="_newSession"]:hover {
        background: var(--dsw-alias-button-info-hover) !important;
        border-color: var(--dsw-alias-button-info-hover) !important;
      }
      html[data-dsh-ux-quietnew="on"] [data-slot="sidebar"] button[class*="_newSession"] {
        background: color-mix(in srgb, var(--dsw-specific-sidebar-fill) 92%, var(--dsw-alias-label-primary) 8%) !important;
        border-color: var(--dsw-alias-border-l2) !important;
        color: var(--dsw-alias-label-primary) !important;
      }
      html[data-dsh-ux-quietnew="on"] [data-slot="sidebar"] button[class*="_newSession"]:hover {
        background: color-mix(in srgb, var(--dsw-specific-sidebar-fill) 86%, var(--dsw-alias-label-primary) 14%) !important;
      }

      /* ---- 账户余额 / 用量坞：闸门 html[data-dsh-ux-usage="on"] ---- */
      html[data-dsh-ux-usage="on"] [data-slot="conversation.composer.dock"] {
        display: flex !important;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      html[data-dsh-ux-usage="on"] [data-slot="conversation.composer.dock"] > div:first-child {
        flex: 1 1 auto;
        min-width: 0;
        width: auto !important;
      }

      /* ---- 折叠：闸门 html[data-dsh-ux-fold="on"] ----
         仅 0.1.x 扁平聊天流里由插件自己隐藏中间产物（插入即隐藏，无高度突变）。
         0.2.0 的 [data-step-process-content] 是官方过程分组内容，其显隐由官方
         「轮次过程折叠」负责；插件只当摘要器，不能再 display:none 跟官方打架。 */
      html[data-dsh-ux-fold="on"] [data-chat-flow]:not([data-step-process-content]) > [data-chat-flow-kind="tool-call"],
      html[data-dsh-ux-fold="on"] [data-chat-flow]:not([data-step-process-content]) > [data-chat-flow-kind="context"] { display:none !important }
      html[data-dsh-ux-fold="on"] [data-chat-flow]:not([data-step-process-content]) > [data-chat-flow-kind="assistant-step"] [data-variant="think"] { display:none !important }
      html[data-dsh-ux-fold="on"] [data-chat-flow]:not([data-step-process-content]) > [data-chat-flow-kind="assistant-step"] [data-tool] { display:none !important }
      html[data-dsh-ux-fold="on"] [data-chat-flow]:not([data-step-process-content]) > [data-chat-flow-kind="assistant-step"] :has(> [data-sample="bash"]) { display:none !important }
      html[data-dsh-ux-fold="on"] [data-chat-flow]:not([data-step-process-content]) > [data-chat-flow-kind="tool-call"].dsh-ec-show,
      html[data-dsh-ux-fold="on"] [data-chat-flow]:not([data-step-process-content]) > [data-chat-flow-kind="context"].dsh-ec-show { display:block !important }
      html[data-dsh-ux-fold="on"] [data-chat-flow]:not([data-step-process-content]) > [data-chat-flow-kind="assistant-step"].dsh-ec-think-open [data-variant="think"] { display:flex !important }
      html[data-dsh-ux-fold="on"] [data-chat-flow]:not([data-step-process-content]) > [data-chat-flow-kind="assistant-step"].dsh-ec-tools-open [data-tool] { display:flex !important }
      html[data-dsh-ux-fold="on"] [data-chat-flow]:not([data-step-process-content]) > [data-chat-flow-kind="assistant-step"].dsh-ec-tools-open :has(> [data-sample="bash"]) { display:flex !important }

      /* ==========================================================================
         2) 插件自有节点样式（只在对应功能渲染出节点时才有消费者）
         ========================================================================== */

      /* ---- 余额 / 用量单元格 ---- */
      .dsh-balance-cell{display:inline-flex;align-items:center;gap:6px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);white-space:nowrap;flex:none;padding-top:4px}
      .dsh-balance-cell .dsh-balance-val{cursor:pointer;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;text-decoration:none}
      .dsh-balance-cell .dsh-balance-val:hover{color:var(--dsw-alias-brand-primary)}
      .dsh-balance-chart{width:15px;height:15px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;padding:0}
      .dsh-balance-chart:hover{color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover)}
      .dsh-balance-err{color:var(--dsw-alias-state-warn-primary);cursor:pointer}
      /* 官方 API 峰谷徽标：峰=琥珀、谷=绿，与用量/余额同一行；点击弹出官方规则 */
      .dsh-peak{display:inline-flex;align-items:center;gap:4px;margin:0 0 0 2px;padding:0 6px;border-radius:999px;border:1px solid;font-family:inherit;font-size:10px;line-height:15px;cursor:pointer;appearance:none;-webkit-appearance:none}
      .dsh-peak:hover{filter:brightness(1.08)}
      .dsh-peak:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
      .dsh-peak-dot{width:5px;height:5px;border-radius:50%;background:currentColor}
      .dsh-peak[data-peak="1"]{color:var(--dsw-alias-state-warn-primary);border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 42%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent)}
      .dsh-peak[data-peak="0"]{color:var(--dsw-alias-state-success-primary);border-color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 42%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent)}
      /* 峰谷规则浮层：fixed 定位，跟随徽标；layer 透明、点外部即关 */
      .dsh-peak-pop-layer{position:fixed;inset:0;z-index:1000;background:transparent}
      .dsh-peak-pop{position:fixed;z-index:1001;box-sizing:border-box;padding:12px 14px;border-radius:12px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-shadow-lv3);color:var(--dsw-alias-label-primary);font-size:12px;line-height:18px;text-align:left;white-space:normal;cursor:default}
      .dsh-peak-pop-title{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;font-weight:600;margin-bottom:8px}
      .dsh-peak-pop-close{width:18px;height:18px;padding:0;border:0;border-radius:4px;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:15px;line-height:18px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
      .dsh-peak-pop-close:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}
      .dsh-peak-pop-state{display:flex;align-items:center;gap:6px;color:var(--dsw-alias-label-secondary);margin-bottom:6px}
      .dsh-peak-pop-pill{display:inline-flex;align-items:center;justify-content:center;min-width:20px;padding:0 5px;border-radius:999px;border:1px solid;font-size:10px;line-height:15px;font-weight:600}
      .dsh-peak-pop-state[data-peak="1"] .dsh-peak-pop-pill{color:var(--dsw-alias-state-warn-primary);border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 42%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent)}
      .dsh-peak-pop-state[data-peak="0"] .dsh-peak-pop-pill{color:var(--dsw-alias-state-success-primary);border-color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 42%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent)}
      .dsh-peak-pop-rule{margin:6px 0 8px;padding-left:16px;color:var(--dsw-alias-label-secondary)}
      .dsh-peak-pop-rule li{margin:3px 0}
      .dsh-peak-pop-next{margin:0 0 6px;color:var(--dsw-alias-label-secondary)}
      .dsh-peak-pop-next b{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}
      .dsh-peak-pop-src{margin:0 0 4px;font-size:11px;color:var(--dsw-alias-label-tertiary)}
      .dsh-peak-pop-src a{color:var(--dsw-alias-brand-primary);text-decoration:none}
      .dsh-peak-pop-src a:hover{text-decoration:underline}
      .dsh-peak-pop-note{margin:0;font-size:11px;color:var(--dsw-alias-label-tertiary)}
      .dsh-usage-backdrop{position:fixed;inset:0;z-index:1000;background:color-mix(in srgb, var(--dsw-alias-bg-base) 55%, transparent);display:flex;align-items:center;justify-content:center}
      .dsh-usage-panel{width:min(760px,92vw);max-height:84vh;overflow:auto;box-sizing:border-box;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:16px;box-shadow:var(--dsw-shadow-lv3);padding:16px 20px;color:var(--dsw-alias-label-primary)}
      .dsh-usage-header{display:flex;align-items:center;gap:12px;margin-bottom:4px}
      .dsh-usage-title{font-size:15px;font-weight:600;flex:1;margin:0}
      .dsh-usage-sub{font-size:12px;color:var(--dsw-alias-label-tertiary);margin:0 0 10px}
      .dsh-usage-btn{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);border-radius:8px;padding:4px 10px;font-size:12px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}
      .dsh-usage-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}
      .dsh-usage-btn:disabled{opacity:.6;cursor:default}
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

      /* ---- 设置页（settings.section:「界面增强」）----
         度量对齐官方设置行（ui-settings-general 的 DeveloperToolsRow）：
         padding 16px 0、border-bottom .5px、标题 14px/20、说明 12px/18。 */
      .dshx-page{display:flex;flex-direction:column;width:100%}
      .dshx-row{display:flex;justify-content:space-between;align-items:center;gap:24px;padding:16px 0;border-bottom:.5px solid var(--dsw-alias-border-l2)}
      .dshx-row:last-child{border-bottom:none}
      .dshx-main{flex:1;min-width:0}
      .dshx-title{color:var(--dsw-alias-label-primary);font-size:14px;line-height:20px}
      .dshx-desc{color:var(--dsw-alias-label-secondary);margin-top:4px;font-size:12px;line-height:18px}
      .dshx-note{color:var(--dsw-alias-label-tertiary);margin-top:4px;font-size:12px;line-height:18px}
      .dshx-group{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:500;line-height:22px;padding:20px 0 2px}
      /* 枚举行（字体方案 / 字重）：标题在上、胶囊在下，六选一也不会挤成一团 */
      .dshx-choice{display:flex;flex-direction:column;gap:8px;padding:16px 0;border-bottom:.5px solid var(--dsw-alias-border-l2)}
      /* 主题下拉：25 套配色不适合铺成胶囊墙，optgroup 对应四个谱系 */
      .dshx-select-wrap{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding-top:2px}
      .dshx-select{appearance:none;-webkit-appearance:none;box-sizing:border-box;min-width:260px;max-width:100%;padding:6px 30px 6px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background-color:var(--dsw-alias-bg-base);background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%23888' stroke-width='1.5'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;background-size:12px 12px;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;cursor:pointer}
      .dshx-select:hover:not(:disabled){border-color:var(--dsw-alias-brand-primary)}
      .dshx-select:disabled{cursor:default;opacity:.55}
      .dshx-select:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
      .dshx-swatches{display:inline-flex;gap:4px;flex:none}
      .dshx-swatch{width:14px;height:14px;border-radius:4px;border:1px solid rgba(0,0,0,.16)}
      .dshx-pills{display:flex;flex-wrap:wrap;gap:8px;padding-top:2px}
      .dshx-pill{display:inline-flex;align-items:center;gap:6px;box-sizing:border-box;padding:6px 12px;border:.5px solid var(--dsw-alias-border-l4);border-radius:999px;background:0 0;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;cursor:pointer}
      .dshx-pill:hover:not(:disabled):not(.dshx-pill-on){background:var(--dsw-alias-interactive-bg-hover)}
      .dshx-pill.dshx-pill-on{background:var(--dsw-alias-bg-module-platform);border-color:var(--dsw-alias-brand-primary)}
      .dshx-pill:disabled{cursor:default;opacity:.45}
      .dshx-pill-badge{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:18px}
      .dshx-row-off .dshx-title,.dshx-row-off .dshx-desc{opacity:.55}
      .dshx-banner{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:12px 14px;margin:14px 0 2px;border-radius:12px;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
      .dshx-banner[data-level="warn"]{color:var(--dsw-alias-state-warn-primary);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 10%, transparent)}
      .dshx-banner b{color:inherit}
      /* 设置页顶部的 GitHub Star 入口：纯展示，无开关、无状态、不写 cookie */
      .dshx-star{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 12px;margin:2px 0 4px;border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
      .dshx-star-icon{flex:none;width:16px;height:16px;color:var(--dsw-alias-label-primary)}
      .dshx-star-text{flex:1 1 220px;min-width:0}
      .dshx-star-text b{color:var(--dsw-alias-label-primary);font-weight:500}
      .dshx-star-btn{flex:none;display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:16px;text-decoration:none;cursor:pointer}
      .dshx-star-btn:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
      .dshx-star-btn:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
      .dshx-btn{flex:none;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);border-radius:8px;padding:4px 10px;font-size:12px;font-family:inherit;cursor:pointer}
      .dshx-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}
      .dshx-foot{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:18px 0 4px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
      /* 官方 Switch 的度量（ui-primitives Switch.module.css）——只在壳没把 primitives
         列为平台种子时才用到；种子可用时 SwitchCell 直接用官方组件，不碰这段。 */
      .dshx-switch{box-sizing:border-box;position:relative;flex:0 0 auto;width:36px;height:20px;padding:2px;border:0;border-radius:999px;corner-shape:round;background:var(--dsw-alias-border-l3);cursor:pointer}
      .dshx-switch[aria-checked="true"]{background:var(--dsw-alias-brand-primary)}
      .dshx-switch:disabled{cursor:default;opacity:.5}
      .dshx-switch:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
      .dshx-switch-thumb{display:block;width:16px;height:16px;border-radius:50%;corner-shape:round;background:var(--dsw-alias-label-primary-foreground);transition:transform 120ms ease}
      .dshx-switch[aria-checked="false"] .dshx-switch-thumb{background:var(--dsw-alias-switch-thumb)}
      .dshx-switch[aria-checked="true"] .dshx-switch-thumb{transform:translateX(16px)}
    `;

    /**
     * 字体层。参考《终端排版哲学：中文优先与 0.5 窄体等宽工程实战》：
     *
     *   · 汉字是不可妥协的 1.0 正方；要让「2 个西文字符 = 1 个汉字」严格成立，
     *     西文必须收窄到 0.5（Condensed Monospace）。
     *   · 以西文为基准的字体（Menlo/Consolas/JetBrains Mono/Fira Code/Maple Mono 等，
     *     西文 0.6~0.67）会把汉字容器撑到 1.2：汉字被横向拉宽 20%（矮胖）或两边留白。
     *   · 本机 CoreText 实测比值为：Sarasa Mono/Term SC = 0.500/1.000（2.000）、
     *     Noto Sans Mono CJK SC = 0.500/1.000（2.000）、Maple Mono NF CN = 0.600/1.200（2.000）、
     *     Sarasa Gothic/UI SC = 0.562/1.000（1.78，不满足 0.5，故未列入方案）。
     *   · Mono 与 Term 的差别只在东亚歧义字符（—……→★■●）：Mono 全角、Term 半角。
     *
     * 闸门是 data-dsh-ux-font（枚举）。默认栈写在 `:not([...="off"])` 上，所以：
     *   - 未知取值（例如旧宿主半写的 "on"）会自动落到「自动」栈，而不是让变量悬空、
     *     把整条字体声明变成 invalid；
     *   - 显式方案写在后面，同特异性下按源序覆盖默认栈；
     *   - 总开关关闭时客户端把 font 写成 off，整层随之撤下。
     *
     * 字重：标准 = 正文 400 / 强调 500（官方字重）；半粗 = 600 / 700，用字族自带的
     * 矢量 SemiBold（思源黑体、Iosevka 都有真实面）。同时 font-synthesis: none 关掉
     * 算法级伪粗/伪斜 —— 文章 §3.1：人工外扩加粗会挤占字怀、笔画黏连，宁可换真实面。
     */
    const FONT_STACKS = {
      auto: `"Sarasa Mono SC", "Sarasa Term SC", "Sarasa Fixed SC", "Noto Sans Mono CJK SC", "Maple Mono NF CN", "Maple Mono", "PingFang SC", "Hiragino Sans GB", ui-monospace, "SF Mono", Menlo, monospace`,
      "sans-mono": `"Sarasa Mono SC", "Sarasa Fixed SC", "Noto Sans Mono CJK SC", "PingFang SC", "Hiragino Sans GB", ui-monospace, "SF Mono", Menlo, monospace`,
      "sans-term": `"Sarasa Term SC", "Sarasa Fixed SC", "Noto Sans Mono CJK SC", "PingFang SC", "Hiragino Sans GB", ui-monospace, "SF Mono", Menlo, monospace`,
      noto: `"Noto Sans Mono CJK SC", "Sarasa Mono SC", "Sarasa Term SC", "PingFang SC", "Hiragino Sans GB", ui-monospace, "SF Mono", Menlo, monospace`,
      maple: `"Maple Mono NF CN", "Maple Mono", "Sarasa Mono SC", "Sarasa Term SC", "PingFang SC", "Hiragino Sans GB", ui-monospace, "SF Mono", Menlo, monospace`,
    };

    const FONT_CSS = `
      /* ---- 字体方案 → 家族栈 ---- */
      html:not([data-dsh-ux-font="off"]),
      html:not([data-dsh-ux-font="off"]) body {
        --dshx-font-family: ${FONT_STACKS.auto};
      }
      html[data-dsh-ux-font="sans-mono"] body { --dshx-font-family: ${FONT_STACKS["sans-mono"]}; }
      html[data-dsh-ux-font="sans-term"] body { --dshx-font-family: ${FONT_STACKS["sans-term"]}; }
      html[data-dsh-ux-font="noto"] body { --dshx-font-family: ${FONT_STACKS.noto}; }
      html[data-dsh-ux-font="maple"] body { --dshx-font-family: ${FONT_STACKS.maple}; }

      /* ---- 字重：四档令牌（官方取值 → 标准保持原值 / 半粗整体上抬一档，封顶 700） ----
         档位来自官方令牌：A=正文 400、B=强调 500、C=半粗 600、D=粗 700。
         半粗模式下 A→600、B→700、C→700、D→700，层级仍然是「正文 < 强调」。
         本机 AppKit 实测字面：Sarasa Mono/Term SC 有 Regular(400)/SemiBold(600)/Bold(700)，
         Maple Mono NF CN 连 Medium(500) 都有 —— 这两族在任何模式下都用矢量字重；
         Noto Sans Mono CJK SC 只有 Regular/Bold，半粗模式下正文会直接落到 Bold（偏重但不合成）。 */
      html:not([data-dsh-ux-font="off"]) body {
        --dshx-w-a: 400;
        --dshx-w-b: 500;
        --dshx-w-c: 600;
        --dshx-w-d: 700;
      }
      html:not([data-dsh-ux-font="off"])[data-dsh-ux-fontweight="semibold"] body {
        --dshx-w-a: 600;
        --dshx-w-b: 700;
        --dshx-w-c: 700;
        --dshx-w-d: 700;
      }

      /* ---- 令牌接管 ---- */
      html:not([data-dsh-ux-font="off"]) body {
        --dsw-font-family: var(--dshx-font-family) !important;
        --ds-font-family-code: var(--dshx-font-family) !important;
        /* 关掉合成加粗/合成斜体：只认字族自己的矢量字重（文章 font-thicken=false 的等价物） */
        font-synthesis: none;
        --dsw-font-xl-24: var(--dshx-w-c) 22px/28px var(--dsw-font-family) !important;
        --dsw-font-l-20: var(--dshx-w-b) 19px/25px var(--dsw-font-family) !important;
        --dsw-font-m-18: var(--dshx-w-b) 15px/22px var(--dsw-font-family) !important;
        --dsw-font-base-16: var(--dshx-w-a) 15px/21px var(--dsw-font-family) !important;
        --dsw-font-base-strong-16: var(--dshx-w-b) 15px/21px var(--dsw-font-family) !important;
        --dsw-font-s-14: var(--dshx-w-a) 13px/18px var(--dsw-font-family) !important;
        --dsw-font-s-strong-14: var(--dshx-w-b) 13px/18px var(--dsw-font-family) !important;
        --dsw-font-xs-13: var(--dshx-w-a) 12px/16px var(--dsw-font-family) !important;
        --dsw-font-xs-strong-13: var(--dshx-w-b) 12px/16px var(--dsw-font-family) !important;
        --dsw-font-xxs-12: var(--dshx-w-a) 11px/15px var(--dsw-font-family) !important;
        --dsw-font-xxs-strong-12: var(--dshx-w-b) 11px/15px var(--dsw-font-family) !important;
        --dsw-font-xxxs-11: var(--dshx-w-a) 11px/13px var(--dsw-font-family) !important;
        --dsw-font-xxxs-strong-11: var(--dshx-w-b) 11px/13px var(--dsw-font-family) !important;
        --dsw-font-markdown-h1: var(--dshx-w-d) 22px/28px var(--dsw-font-family) !important;
        --dsw-font-markdown-h2: var(--dshx-w-d) 20px/26px var(--dsw-font-family) !important;
        --dsw-font-markdown-h3: var(--dshx-w-d) 18px/24px var(--dsw-font-family) !important;
        --dsw-font-markdown-h4: var(--dshx-w-c) 15px/22px var(--dsw-font-family) !important;
        --dsw-font-markdown-base: var(--dshx-w-a) 15px/22px var(--dsw-font-family) !important;
        --dsw-font-markdown-base-strong: var(--dshx-w-c) 15px/22px var(--dsw-font-family) !important;
        --dsw-font-markdown-base-italic: italic var(--dshx-w-a) 15px/22px var(--dsw-font-family) !important;
        --dsw-font-markdown-base-strong-italic: italic var(--dshx-w-c) 15px/22px var(--dsw-font-family) !important;
        --dsw-font-markdown-small: var(--dshx-w-a) 13px/19px var(--dsw-font-family) !important;
        --dsw-font-markdown-small-strong: var(--dshx-w-c) 13px/19px var(--dsw-font-family) !important;
        --dsw-font-markdown-small-italic: italic var(--dshx-w-a) 13px/19px var(--dsw-font-family) !important;
        --dsw-font-markdown-small-strong-italic: italic var(--dshx-w-c) 13px/19px var(--dsw-font-family) !important;
        --dsw-font-markdown-table: var(--dshx-w-a) 14px/21px var(--dsw-font-family) !important;
        --dsw-font-markdown-table-head: var(--dshx-w-b) 14px/21px var(--dsw-font-family) !important;
        --dsw-font-markdown-code: var(--dshx-w-a) 13px/18px var(--ds-font-family-code) !important;
        --dsw-font-markdown-code-block: var(--dshx-w-a) 12px/17px var(--ds-font-family-code) !important;
        --dsw-font-markdown-code-block-small: var(--dshx-w-a) 11px/15px var(--ds-font-family-code) !important;
      }

      /* 对齐自检块（文章 §5 的校验文本）：等宽 + 不折行，2:1 网格可以直接用肉眼看 */
      .dshx-grid{font-family:var(--dshx-font-family,monospace);white-space:pre;overflow-x:auto;font-size:12px;line-height:20px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-base);border:.5px solid var(--dsw-alias-border-l2);border-radius:8px;padding:10px 12px;margin-top:8px}
    `;

    /**
     * 判断某个字体族是否真的装了：拿「明确不存在的族名 + 回退栈」当基线，
     * 候选族名量出来的宽度只要不同，就说明它确实被用上了。
     * 比原来的「对比 monospace/serif」稳：Menlo 与 Maple Mono 的拉丁字宽都是 0.6 上下，
     * 用通用族当基线时容易误判；用「不存在的族名」当基线则完全取决于回退是否发生。
     * 拉丁探针 + 汉字探针取或：Maple Mono 这种只有拉丁的字体靠前者命中，
     * 而只有汉字的字体靠后者命中。
     */
    function familyInstalled(family) {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return false;
        const clean = String(family).replace(/["\\]/g, "");
        const measure = (stack, text) => { ctx.font = "72px " + stack; return Math.round(ctx.measureText(text).width * 100) / 100; };
        const probes = ["mMMMMmmmlllii0123456789", "永和九年岁在癸丑之"];
        for (const text of probes) {
          const fallback = measure('"__dsh_ux_no_such_family__", monospace', text);
          if (measure('"' + clean + '", monospace', text) !== fallback) return true;
        }
        return false;
      } catch (_) {
        return false;
      }
    }

    /** 方案是否可用：families 里任一命中即可（auto 只要有一个候选命中就算可用）。 */
    function schemeAvailable(scheme, cache) {
      if (scheme.key === "off") return true;
      const hit = (cache && cache[scheme.key] !== undefined)
        ? cache[scheme.key]
        : scheme.families.some((family) => familyInstalled(family));
      if (cache) cache[scheme.key] = hit;
      return hit;
    }

    /** 探测全部方案，供设置页显示「本机已装/未装」。探测很便宜，但一次会话只做一次。 */
    function detectSchemes() {
      const result = {};
      for (const scheme of FONT_SCHEMES) result[scheme.key] = schemeAvailable(scheme);
      return result;
    }

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

    /* --------------------------------------------------------------------------
       官方 API 峰谷计费
       官方定义（2026-08-23 调整；2026-09-19 补充法定节假日口径）：
       · 高峰：北京时间周一至周五（不含中国法定节假日）9:00–12:00、14:00–18:00；
       · 空闲：其余时段。周六、周日与中国法定节假日全天按空闲计费，
         调休上班的周末也按周末计，不恢复峰谷；
       · 空闲时段价格为高峰时段价格的一半。
       只有「最近一次请求真实使用的 provider」是官方时才提示：余额能查不代表本轮走官方 ——
       用户可能刚切到 scnet / opencode2dsh。计价口径与 host 的 pricingFor 保持一致。
       -------------------------------------------------------------------------- */
    const OFFICIAL_PROVIDERS = ["deepseek-official", "deepseek-account"];
    const PEAK_WINDOWS = [[9 * 60, 12 * 60], [14 * 60, 18 * 60]];
    const BEIJING_OFFSET_MS = 8 * 3600 * 1000;
    const MINUTE_MS = 60 * 1000;
    const WEEKDAY_LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

    /* 官方计价时间线（北京时间）。客户端只判断「现在是否峰时」，host 按同一条时间线算历史成本。 */
    const PEAK_PRICING_EPOCH = Date.UTC(2026, 7, 16, 16, 0); // 2026-08-17 00:00 启用峰谷定价
    const WEEKEND_RULE_EPOCH = Date.UTC(2026, 7, 22, 16, 0); // 2026-08-23 00:00 起周末全谷

    /* 中国法定节假日：内置 2026 兜底（国务院办公厅《关于 2026 年部分节假日安排的通知》）。
       运行时由 host 半的 /enh/calendar 每年自动拉取、解析并缓存（见 lib/calendar.js），
       跨年不需要改代码；内置表只保证离线/首帧也能判对 2026。 */
    const BUILTIN_CN_HOLIDAYS = new Set([
      "2026-01-01", "2026-01-02", "2026-01-03",
      "2026-02-15", "2026-02-16", "2026-02-17", "2026-02-18", "2026-02-19",
      "2026-02-20", "2026-02-21", "2026-02-22", "2026-02-23",
      "2026-04-04", "2026-04-05", "2026-04-06",
      "2026-05-01", "2026-05-02", "2026-05-03", "2026-05-04", "2026-05-05",
      "2026-06-19", "2026-06-20", "2026-06-21",
      "2026-09-25", "2026-09-26", "2026-09-27",
      "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-05",
      "2026-10-06", "2026-10-07",
    ]);
    /* 运行时日历状态：host 返回哪一年就覆盖哪一年，没返回的年份继续用内置兜底。 */
    const holidayState = {
      offDays: BUILTIN_CN_HOLIDAYS,
      source: "builtin",
      updatedAt: 0,
      version: 0,
      listeners: new Set(),
    };
    function subscribeHoliday(fn) {
      holidayState.listeners.add(fn);
      return () => { holidayState.listeners.delete(fn); };
    }
    function holidayVersion() {
      return holidayState.version;
    }
    /** 订阅日历版本：自动拉取完成后触发重渲染，徽标与倒计时立即改用新日历。 */
    function useHolidayVersion() {
      return React.useSyncExternalStore(subscribeHoliday, holidayVersion, holidayVersion);
    }
    function emitHolidayChange() {
      holidayState.version += 1;
      for (const fn of Array.from(holidayState.listeners)) {
        try { fn(); } catch (_) {}
      }
    }
    /**
     * 合并 /enh/calendar 的响应：成功返回的年份以远端为准（可纠正内置表的错漏），
     * 没返回的年份保留内置兜底。返回 false = 没有任何可用年份（离线/首启动），
     * 现有日历保持不变。
     */
    function applyHolidayCalendar(response) {
      const years = response && Array.isArray(response.years) ? response.years : [];
      const fetched = new Map();
      let source = "";
      let updatedAt = 0;
      for (const entry of years) {
        if (entry === null || typeof entry !== "object") continue;
        const year = Number(entry.year);
        if (!Number.isInteger(year) || !Array.isArray(entry.offDays) || entry.offDays.length === 0) continue;
        fetched.set(year, entry.offDays.filter((date) => typeof date === "string"));
        if (typeof entry.source === "string" && entry.source !== "") source = entry.source;
        updatedAt = Math.max(updatedAt, Number(entry.fetchedAt) || 0);
      }
      if (fetched.size === 0) return false;
      const merged = new Set();
      for (const date of BUILTIN_CN_HOLIDAYS) {
        const year = Number(date.slice(0, 4));
        if (!fetched.has(year)) merged.add(date);
      }
      for (const list of fetched.values()) for (const date of list) merged.add(date);
      holidayState.offDays = merged;
      holidayState.source = source;
      holidayState.updatedAt = updatedAt;
      emitHolidayChange();
      return true;
    }
    /** 拉当年 + 次年的节假日日历：次年安排年末才发布，空响应会被忽略，6 小时后再试。 */
    function loadHolidayCalendar() {
      const year = beijingParts(Date.now()).year;
      return api("calendar?years=" + year + "," + (year + 1))
        .then((response) => applyHolidayCalendar(response))
        .catch(() => false);
    }
    /** 启动自动刷新（apply 时调用，返回卸载函数）。 */
    function startHolidayCalendar() {
      let timer = null;
      let stopped = false;
      const refresh = () => { if (!stopped) loadHolidayCalendar(); };
      refresh();
      timer = setInterval(refresh, 6 * 3600 * 1000);
      return () => {
        stopped = true;
        if (timer !== null) {
          clearInterval(timer);
          timer = null;
        }
      };
    }
    /* 测试复位：把运行时时历退回内置兜底。 */
    function resetHolidayCalendarForTest() {
      holidayState.offDays = BUILTIN_CN_HOLIDAYS;
      holidayState.source = "builtin";
      holidayState.updatedAt = 0;
      holidayState.version += 1;
    }

    function beijingParts(nowMs) {
      const d = new Date(nowMs + BEIJING_OFFSET_MS);
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth() + 1;
      const day = d.getUTCDate();
      return {
        year: year,
        month: month,
        day: day,
        weekday: d.getUTCDay(),
        minute: d.getUTCHours() * 60 + d.getUTCMinutes(),
        dateKey: year + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0"),
      };
    }
    function beijingMinuteOfDay(nowMs) {
      return beijingParts(nowMs).minute;
    }
    function isPeakWindowMinute(minute) {
      return PEAK_WINDOWS.some(([start, end]) => minute >= start && minute < end);
    }
    function isWeekend(nowMs) {
      const weekday = beijingParts(nowMs).weekday;
      return weekday === 0 || weekday === 6;
    }
    function isChinaHoliday(nowMs) {
      return holidayState.offDays.has(beijingParts(nowMs).dateKey);
    }
    /** 该日是否属于「会分峰谷」的日子：8/17 前不计峰谷；8/23 起周末与节假日全天不算高峰日。 */
    function isPeakDay(nowMs) {
      if (nowMs < PEAK_PRICING_EPOCH) return false;
      if (isChinaHoliday(nowMs)) return false;
      if (nowMs >= WEEKEND_RULE_EPOCH && isWeekend(nowMs)) return false;
      return true;
    }
    function isPeakAt(nowMs) {
      return isPeakDay(nowMs) && isPeakWindowMinute(beijingMinuteOfDay(nowMs));
    }
    /** 下一个高峰窗口起点（跨周末/节假日向后找；最多扫 40 天，覆盖春节 9 天长假）。 */
    function nextPeakStart(nowMs) {
      const minuteIndex = Math.floor((nowMs + BEIJING_OFFSET_MS) / MINUTE_MS);
      const dayStart = minuteIndex - (minuteIndex % 1440);
      for (let offset = 0; offset <= 40; offset++) {
        const dayMinute = dayStart + offset * 1440;
        const dayMs = dayMinute * MINUTE_MS - BEIJING_OFFSET_MS;
        if (!isPeakDay(dayMs)) continue;
        for (const [start] of PEAK_WINDOWS) {
          const candidate = (dayMinute + start) * MINUTE_MS - BEIJING_OFFSET_MS;
          if (candidate > nowMs) return candidate;
        }
      }
      // 兜底：40 天内没有高峰日（数据异常），按次日 09:00 处理。
      return (dayStart + 1440 + 9 * 60) * MINUTE_MS - BEIJING_OFFSET_MS;
    }
    /**
     * 当前峰/谷 + 距下一次切换的分钟数。
     * 谷时返回下一个高峰起点：周五晚 / 周末 / 法定节假日会直接跨到下一个工作日 09:00。
     */
    function pricingClock(nowMs) {
      const parts = beijingParts(nowMs);
      const peak = isPeakAt(nowMs);
      let nextAt;
      if (peak) {
        const endMinute = parts.minute < 12 * 60 ? 12 * 60 : 18 * 60;
        const minuteIndex = Math.floor((nowMs + BEIJING_OFFSET_MS) / MINUTE_MS);
        nextAt = (minuteIndex - parts.minute + endMinute) * MINUTE_MS - BEIJING_OFFSET_MS;
      } else {
        nextAt = nextPeakStart(nowMs);
      }
      const holiday = isChinaHoliday(nowMs);
      const weekend = isWeekend(nowMs);
      let reason = "workday-off";
      if (peak) reason = "workday-peak";
      else if (holiday) reason = "holiday";
      else if (weekend && nowMs >= WEEKEND_RULE_EPOCH) reason = "weekend";
      return {
        peak: peak,
        minutes: Math.max(1, Math.ceil((nextAt - nowMs) / MINUTE_MS)),
        nextPeak: !peak,
        nextAt: nextAt,
        reason: reason,
        holiday: holiday,
        weekend: weekend,
        dateKey: parts.dateKey,
        weekday: parts.weekday,
      };
    }
    function fmtGap(minutes) {
      if (minutes >= 1440) {
        const d = Math.floor(minutes / 1440);
        const h = Math.floor((minutes % 1440) / 60);
        const m = minutes % 60;
        return d + " 天" + (h === 0 ? "" : " " + h + " 小时") + (m === 0 ? "" : " " + m + " 分");
      }
      if (minutes >= 60) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m === 0 ? h + " 小时" : h + " 小时 " + m + " 分";
      }
      return minutes + " 分钟";
    }
    function fmtBeijingTime(ms) {
      const p = beijingParts(ms);
      const hh = String(Math.floor(p.minute / 60)).padStart(2, "0");
      const mm = String(p.minute % 60).padStart(2, "0");
      return p.month + " 月 " + p.day + " 日（" + WEEKDAY_LABELS[p.weekday] + "）" + hh + ":" + mm;
    }
    const PRICING_RULE_BRIEF = "工作日（周一至周五）9:00–12:00、14:00–18:00 高峰，周末与法定节假日全天谷价";
    function pricingHint(clock) {
      if (clock.peak) {
        return "官方 API 峰时计费 · " + PRICING_RULE_BRIEF + " · 距空闲 " + fmtGap(clock.minutes) + "（点击查看官方规则）";
      }
      const prefix = clock.reason === "weekend" ? "今天周末，全天谷价"
        : clock.reason === "holiday" ? "今天法定节假日，全天谷价"
          : "当前非高峰，按空闲半价";
      return "官方 API 空闲半价 · " + prefix + " · 距高峰 " + fmtGap(clock.minutes) + "（点击查看官方规则）";
    }
    function pricingStateText(clock) {
      if (clock.peak) return "当前为「峰」：工作日高峰时段，按峰时价计费";
      if (clock.reason === "holiday") return "当前为「谷」：法定节假日全天按空闲价计费";
      if (clock.reason === "weekend") return "当前为「谷」：周末全天按空闲价计费";
      return "当前为「谷」：工作日非高峰时段，按空闲价计费";
    }
    function isOfficialProvider(provider) {
      return typeof provider === "string" && OFFICIAL_PROVIDERS.indexOf(provider) !== -1;
    }
    const PRICING_SUFFIX = / · 官方 API (峰时计费|空闲半价)$/;
    /** 把峰谷提示挂到「发送」与「选择模型」两个官方按钮的 title 上，不改 DOM 结构。 */
    function syncPricingButtons(clock) {
      const hint = clock.peak ? "官方 API 峰时计费" : "官方 API 空闲半价";
      const targets = [
        document.querySelector('button[aria-label="发送消息"]'),
        document.querySelector('button[aria-label^="选择模型"]'),
      ];
      for (const button of targets) {
        if (button === null) continue;
        const base = (button.getAttribute("title") || "").replace(PRICING_SUFFIX, "");
        button.setAttribute("title", base === "" ? hint : base + " · " + hint);
        button.setAttribute("data-dsh-ux-pricing", clock.peak ? "peak" : "valley");
      }
    }
    function clearPricingButtons() {
      const targets = [
        document.querySelector('button[aria-label="发送消息"]'),
        document.querySelector('button[aria-label^="选择模型"]'),
      ];
      for (const button of targets) {
        if (button === null) continue;
        const base = (button.getAttribute("title") || "").replace(PRICING_SUFFIX, "");
        if (base === "") button.removeAttribute("title");
        else button.setAttribute("title", base);
        button.removeAttribute("data-dsh-ux-pricing");
      }
    }

    /* 点击「峰 / 谷」徽标后的官方规则浮层。用 fixed 定位跟随徽标，
       避免被输入框坞的自带 overflow 裁掉；layer 负责点外部关闭。 */
    const PRICING_DOC_URL = "https://api-docs.deepseek.com/zh-cn/quick_start/pricing/";
    const PRICING_RULES = [
      "高峰：工作日（周一至周五，不含中国法定节假日）北京时间 9:00–12:00、14:00–18:00",
      "空闲：其余时段；周六、周日与法定节假日全天按空闲计费（调休上班的周末也按周末计）",
      "空闲时段价格为高峰时段价格的一半",
    ];
    function PricingPopover({ clock, anchor, onClose }) {
      React.useEffect(() => {
        const onKey = (event) => { if (event.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
      }, [onClose]);
      const base = anchor || { left: 8, top: 120 };
      const win = typeof window !== "undefined" ? window : {};
      const vw = Number(win.innerWidth) || 1024;
      const vh = Number(win.innerHeight) || 768;
      const width = Math.min(360, Math.max(240, vw - 16));
      const left = Math.max(8, Math.min(Number(base.left) || 8, vw - width - 8));
      // 徽标在视口下半部时向上弹，靠近顶部时改向下弹，避免浮层跑出屏幕。
      const topPx = Number(base.top) || vh - 160;
      const bottomPx = Number(base.bottom) || topPx + 20;
      const position = topPx > 320
        ? { left: left + "px", bottom: Math.max(8, vh - topPx + 8) + "px" }
        : { left: left + "px", top: Math.min(vh - 120, bottomPx + 8) + "px" };
      return React.createElement(React.Fragment, null,
        React.createElement("div", { className: "dsh-peak-pop-layer", onClick: onClose }),
        React.createElement("div", {
          className: "dsh-peak-pop",
          style: { ...position, width: width + "px" },
          role: "dialog",
          "aria-label": "官方 API 峰谷计费说明",
          onClick: (event) => event.stopPropagation(),
        },
          React.createElement("div", { className: "dsh-peak-pop-title" },
            React.createElement("span", null, "官方 API 峰谷计费"),
            React.createElement("button", {
              className: "dsh-peak-pop-close",
              type: "button",
              title: "关闭",
              onClick: onClose,
            }, "×")),
          React.createElement("div", { className: "dsh-peak-pop-state", "data-peak": clock.peak ? "1" : "0" },
            React.createElement("span", { className: "dsh-peak-pop-pill" }, clock.peak ? "峰" : "谷"),
            React.createElement("span", null, pricingStateText(clock))),
          React.createElement("ul", { className: "dsh-peak-pop-rule" },
            PRICING_RULES.map((text, index) => React.createElement("li", { key: index }, text))),
          React.createElement("p", { className: "dsh-peak-pop-next" },
            "下一次切换：",
            React.createElement("b", null, fmtBeijingTime(clock.nextAt)),
            " · " + (clock.nextPeak ? "转高峰" : "转空闲") + "（" + fmtGap(clock.minutes) + "后）"),
          React.createElement("p", { className: "dsh-peak-pop-src" },
            "来源：",
            React.createElement("a", {
              href: PRICING_DOC_URL,
              target: "_blank",
              rel: "noreferrer",
            }, "DeepSeek 官方文档《模型 & 价格》"),
            " · 2026-08-23 周末调整 / 09-19 节假日口径"),
          React.createElement("p", { className: "dsh-peak-pop-note" },
            "仅在最近一次请求走官方 API / 官方账号时显示 · 节假日日历每年自动获取并缓存")));
    }

    /* ==========================================================================
       配置：单一状态对象 + cookie 持久化 + html 属性投影
       - cookie 供 host 在 index 注入的脚本于首帧前恢复，避免配色闪一帧；
       - html 属性是 CSS 闸门，改属性即改行为 —— 这就是「即时开关」的实现方式。
       ========================================================================== */

    /**
     * 归一化：布尔键只收布尔；枚举键只收白名单里的值，且兼容旧版的布尔写法
     * （font: true → auto、false → off，老 cookie 不会把字体设成非法值）。
     * 其余键/类型一律忽略。
     */
    function normalizeState(raw) {
      const out = { ...DEFAULT_STATE };
      if (raw !== null && typeof raw === "object") {
        if (typeof raw.master === "boolean") out.master = raw.master;
        for (const key of BOOL_KEYS) if (typeof raw[key] === "boolean") out[key] = raw[key];
        for (const [key, allowed] of Object.entries(ENUM_KEYS)) {
          const value = raw[key];
          const mapped = value === true ? DEFAULT_STATE[key] : value === false ? "off" : value;
          if (typeof mapped === "string" && allowed.includes(mapped)) out[key] = mapped;
        }
        // v1 → v2：旧版默认是「跟随配色 + 标准」。rev 缺失时把还停在旧默认的项抬到推荐档；
        // 显式选过深墨/纯黑、半粗的项保持不动。迁移后 rev=2，之后再选回旧值不会被反复改写。
        if (raw.rev === undefined) {
          if (raw.ink === undefined || raw.ink === "theme") out.ink = "deep";
          if (raw.fontweight === undefined || raw.fontweight === "regular") out.fontweight = "semibold";
        }
      }
      return out;
    }

    /** 序列化给 cookie 用（与 host 注入脚本的 parse 对称）。 */
    function serializeState(state) {
      return encodeURIComponent(JSON.stringify(normalizeState(state)));
    }

    function parseState(text) {
      if (typeof text !== "string" || text === "") return null;
      try {
        return normalizeState(JSON.parse(decodeURIComponent(text)));
      } catch (_) {
        return null;
      }
    }

    /** 从 html 属性读回状态：host 注入脚本已经算过一遍，避免两边判断分叉。 */
    function readStateFromDom() {
      const el = document.documentElement;
      const state = { ...DEFAULT_STATE };
      try {
        const master = el.getAttribute("data-dsh-ux");
        if (master === "on" || master === "off") state.master = master === "on";
        for (const key of BOOL_KEYS) {
          const value = el.getAttribute("data-dsh-ux-" + key);
          if (value === "on" || value === "off") state[key] = value === "on";
        }
        for (const [key, allowed] of Object.entries(ENUM_KEYS)) {
          const value = el.getAttribute("data-dsh-ux-" + key);
          if (value !== null && allowed.includes(value)) state[key] = value;
        }
      } catch (_) {}
      return state;
    }

    /**
     * 从 cookie 读回原始状态（属性里只有「总开关 && 分项」的合取，分项选择只存在这里）。
     * 改名遗留的 dsh-enhance-config 只读一次：读到即写进新键并清掉旧键，用户不必重设。
     */
    function readCookieState() {
      try {
        const read = (key) => new RegExp("(?:^|; )" + key + "=([^;]*)").exec(document.cookie);
        const match = read(CONFIG_COOKIE);
        if (match !== null) return parseState(match[1]);
        const legacy = read(LEGACY_CONFIG_COOKIE);
        if (legacy === null) return null;
        const migrated = parseState(legacy[1]);
        document.cookie = CONFIG_COOKIE + "=" + serializeState(migrated) + "; path=/; max-age=31536000; samesite=lax";
        document.cookie = LEGACY_CONFIG_COOKIE + "=; path=/; max-age=0; samesite=lax";
        return migrated;
      } catch (_) {
        return null;
      }
    }

    /**
     * 初始状态：cookie 优先，属性兜底。
     * 属性只存合取，总开关关掉时看不出分项原本的选择 —— 所以 cookie 在时必须信 cookie，
     * 否则「总开关关一次再开回来」会把用户之前的分项选择抹平。
     */
    function initialState() {
      return readCookieState() ?? readStateFromDom();
    }

    /**
     * 把状态投影到 html 属性：CSS 闸门与配置永远同向。
     * 布尔键：总开关关掉时统一写 off（属性是「总开关 && 分项」的合取）。
     * 枚举键：总开关关掉时 theme / font 写 off（配色层与字体层随之撤下）；
     * fontweight 与 ink 保持原值 —— 它们只在各自层里生效，没有消费者时留着，
     * 方便下次打开时原样恢复。theme-tone 是派生属性，让墨色层知道当前底色深浅。
     */
    function applyStateToDom(state) {
      try {
        const el = document.documentElement;
        el.setAttribute("data-dsh-ux", state.master ? "on" : "off");
        for (const key of BOOL_KEYS) {
          el.setAttribute("data-dsh-ux-" + key, state.master && state[key] ? "on" : "off");
        }
        const theme = state.master && ENUM_KEYS.theme.includes(state.theme) ? state.theme : "off";
        el.setAttribute("data-dsh-ux-theme", theme);
        el.setAttribute("data-dsh-ux-theme-tone", theme === "off" ? "auto" : THEME_TONES[theme] || "auto");
        el.setAttribute("data-dsh-ux-font", state.master ? state.font : "off");
        el.setAttribute("data-dsh-ux-fontweight", state.fontweight);
        el.setAttribute("data-dsh-ux-ink", ENUM_KEYS.ink.includes(state.ink) ? state.ink : DEFAULT_STATE.ink);
      } catch (_) {}
    }

    function clearStateFromDom() {
      try {
        const el = document.documentElement;
        el.removeAttribute("data-dsh-ux");
        for (const key of BOOL_KEYS) el.removeAttribute("data-dsh-ux-" + key);
        for (const key of Object.keys(ENUM_KEYS)) el.removeAttribute("data-dsh-ux-" + key);
        el.removeAttribute("data-dsh-ux-theme-tone");
        // 旧版只有一个配色开关（与 data-dsh-ux-theme 同名，重复删一次无害）
        el.removeAttribute("data-dsh-ux-theme");
      } catch (_) {}
    }

    /** 写 cookie。改名前的旧配置键与 1.7.x 的 dsh-enhance-theme 一并清掉，避免多套状态并存。 */
    function persistState(state) {
      try {
        document.cookie = CONFIG_COOKIE + "=" + serializeState(state) + "; path=/; max-age=31536000; samesite=lax";
        document.cookie = LEGACY_CONFIG_COOKIE + "=; path=/; max-age=0; samesite=lax";
        document.cookie = LEGACY_THEME_COOKIE + "=; path=/; max-age=0; samesite=lax";
      } catch (_) {}
    }

    /** 最小可订阅 store：React 侧用 useSyncExternalStore 消费。 */
    function createStore(initial) {
      let state = initial;
      const listeners = new Set();
      const emit = () => { for (const fn of Array.from(listeners)) { try { fn(); } catch (_) {} } };
      return {
        get: () => state,
        subscribe: (fn) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
        /** 布尔功能是否真的生效（总开关关掉时全部按关处理）。 */
        effective: (key) => state.master && state[key] === true,
        /** 字体方案是否真的生效（font 是枚举：off 与总开关关闭都算关）。 */
        fontEnabled: () => state.master && state.font !== "off",
        master: () => state.master,
        set: (key, value) => {
          const next = normalizeState({ ...state, [key]: value });
          if (JSON.stringify(next) === JSON.stringify(state)) return;
          state = next;
          applyStateToDom(state);
          persistState(state);
          emit();
        },
        /** 「全部恢复默认」：布尔全开、字体方案与字重回默认值。 */
        setAll: () => {
          const patch = { master: true };
          for (const key of BOOL_KEYS) patch[key] = true;
          state = normalizeState(patch);
          applyStateToDom(state);
          persistState(state);
          emit();
        },
      };
    }

    const store = createStore(initialState());

    function useStore() {
      return React.useSyncExternalStore(store.subscribe, store.get, store.get);
    }

    /* ==========================================================================
       用量 / 余额组件（只在 usage 打开时渲染）
       ========================================================================== */

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
          React.createElement("p", { className: "dsh-usage-sub" }, "数据来源:DSH 本地会话日志(最近 " + (data && !data.error ? data.sessionsScanned : "?") + " 个会话,含子代理)· 成本按每次请求的模型与时间自动套官方峰谷价(工作日 9:00–12:00、14:00–18:00 高峰,周末与法定节假日全天谷价,空闲价=高峰价一半)"),
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
          React.createElement("p", { className: "dsh-usage-sub" }, "数据来源:本会话完整日志(不受界面加载窗口影响)· 成本按每次请求的模型与时间自动套官方峰谷价(工作日 9:00–12:00、14:00–18:00 高峰,周末与法定节假日全天谷价;2026-08-17 前为不区分峰谷的旧价)"),
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
      const state = useStore();
      const [state2, setState] = React.useState(null);
      const [openOverlay, setOpenOverlay] = React.useState(false);
      const enabled = state.master && state.usage;
      React.useEffect(() => {
        if (!enabled) return;
        let alive = true;
        const load = () => {
          api("balance").then((result) => { if (alive) setState(result); }).catch(() => { if (alive) setState({ error: "查询失败" }); });
        };
        load();
        const timer = setInterval(load, 300000);
        return () => { alive = false; clearInterval(timer); };
      }, [enabled]);
      if (!enabled) return null;
      if (openOverlay) {
        return React.createElement(UsageOverlay, null);
      }
      if (state2 === null) {
        return React.createElement("span", { className: "dsh-balance-cell" }, React.createElement("span", null, "余额查询中…"));
      }
      if (state2.error) {
        return React.createElement("span", { className: "dsh-balance-cell" }, React.createElement("span", {
          className: "dsh-balance-err",
          title: state2.error,
          onClick: () => { api("balance").then(setState).catch(() => {}); },
        }, "余额 " + state2.error));
      }
      const currency = state2.currency || "CNY";
      const symbol = currency === "CNY" ? "¥" : currency === "USD" ? "$" : "";
      const text = symbol + state2.total + (currency !== "CNY" && currency !== "USD" ? " " + currency : "");
      return React.createElement("span", { className: "dsh-balance-cell" },
        React.createElement("span", null, "余额"),
        React.createElement("a", {
          className: "dsh-balance-val",
          href: "https://platform.deepseek.com/usage",
          target: "_blank",
          rel: "noreferrer",
          title: "打开官方页面:充值或查看官方用量(查询于 " + new Date(state2.fetchedAt).toLocaleTimeString() + ")",
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
      useHolidayVersion();
      const state = useStore();
      const [data, setData] = React.useState(null);
      const [openOverlay, setOpenOverlay] = React.useState(false);
      const [pricingOpen, setPricingOpen] = React.useState(false);
      const [pricingAnchor, setPricingAnchor] = React.useState(null);
      const pricingBadgeRef = React.useRef(null);
      const [, tick] = React.useState(0);
      const enabled = state.master && state.usage;
      const provider = data && !data.error ? data.provider : undefined;
      const official = isOfficialProvider(provider);
      React.useEffect(() => {
        if (!enabled) return;
        if (typeof sessionId !== "string" || sessionId === "") return;
        let alive = true;
        const load = () => {
          api("session-usage?sessionId=" + encodeURIComponent(sessionId)).then((r) => { if (alive) setData(r); }).catch(() => { if (alive) setData({ error: true }); });
        };
        load();
        const timer = setInterval(load, 60000);
        return () => { alive = false; clearInterval(timer); };
      }, [sessionId, enabled]);
      // 峰谷状态每 30 秒重算一次：跨过 12:00 / 18:00 时不用等下一次用量轮询。
      React.useEffect(() => {
        if (!enabled || !official) return;
        const timer = setInterval(() => tick((n) => n + 1), 30000);
        return () => clearInterval(timer);
      }, [enabled, official]);
      const clock = pricingClock(Date.now());
      // 切到非官方 provider、或关掉用量时，浮层随之收回，避免留下过期的计价说明。
      React.useEffect(() => {
        if (!enabled || !official) setPricingOpen(false);
      }, [enabled, official]);
      // 官方 API / 官方账号时，把峰谷提示挂到「发送」与「选择模型」按钮的 title 上；
      // 非官方或关掉用量时撤掉，避免误导。
      React.useEffect(() => {
        if (!enabled || !official) return;
        syncPricingButtons(clock);
        return () => { clearPricingButtons(); };
      }, [enabled, official, clock.peak, clock.minutes]);
      const togglePricing = () => {
        if (pricingOpen) { setPricingOpen(false); return; }
        const el = pricingBadgeRef.current;
        const rect = el && typeof el.getBoundingClientRect === "function" ? el.getBoundingClientRect() : null;
        setPricingAnchor(rect ? { left: rect.left, top: rect.top, bottom: rect.bottom } : { left: 8, top: 120, bottom: 140 });
        setPricingOpen(true);
      };
      if (!enabled) return null;
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
        official && React.createElement("button", {
          ref: pricingBadgeRef,
          type: "button",
          className: "dsh-peak",
          "data-peak": clock.peak ? "1" : "0",
          "aria-haspopup": "dialog",
          "aria-expanded": pricingOpen ? "true" : "false",
          title: pricingHint(clock) + (typeof provider === "string" ? "（当前 " + provider + "）" : ""),
          onClick: togglePricing,
        },
          React.createElement("span", { className: "dsh-peak-dot" }),
          clock.peak ? "峰" : "谷"),
        pricingOpen && React.createElement(PricingPopover, {
          clock: clock,
          anchor: pricingAnchor,
          onClose: () => setPricingOpen(false),
        }),
        openOverlay && React.createElement(SessionOverlay, null));
    }

    function DockCell(props) {
      const state = useStore();
      if (!state.master || !state.usage) return null;
      return React.createElement(React.Fragment, null,
        React.createElement(BalanceView, null),
        React.createElement(SessionCostView, props));
    }

    /* ==========================================================================
       折叠引擎：开关驱动 start/stop，关掉时把注入的 DOM 一并收回（不留残骸）

       两条路径按真实 DOM 结构分流：
       · 0.1.x 扁平流：中间产物是 [data-chat-flow] 的直接子节点，插件自己折叠。
       · 0.2.0 官方过程分组：[data-step-process-content] 把成员收进折叠体，
         插件不再碰显隐（官方「轮次过程折叠」负责），只把摘要胶囊挂到默认态
         唯一可见的 [data-chat-flow-kind="turn-process"] 行之后，点击胶囊
         联动该行的官方按钮展开/收起对应轮次。
       ========================================================================== */

    /** 探测折叠契约：0.1.x 扁平流 / 0.2.0 过程分组 / 结构失配（自禁用）。 */
    function detectFoldContract(root) {
      const doc = root || document;
      const hasProcessContent = doc.querySelector("[data-step-process-content]") !== null;
      if (!hasProcessContent) return { mode: "legacy", supported: true, reason: "" };
      const groupRoots = doc.querySelectorAll("[data-chat-group-key]").length;
      const turnProcessRows = doc.querySelectorAll('[data-chat-flow-kind="turn-process"]').length;
      if (groupRoots > 0 || turnProcessRows > 0) return { mode: "process-groups", supported: true, reason: "" };
      return {
        mode: "process-groups",
        supported: false,
        reason: "检测到官方 0.2.0 过程分组容器，但没有分组根或 turn-process 行：官方结构可能已变化，折叠胶囊已自禁用，避免生成不可见节点",
      };
    }

    /** 设置页「折叠胶囊」行的提示文案；旧结构无需提示。 */
    function foldContractNote(root) {
      const contract = detectFoldContract(root);
      if (!contract.supported) return contract.reason;
      if (contract.mode === "process-groups") {
        return "已适配官方 0.2.0 过程分组：显隐交给官方，胶囊挂到「已完成，用时 X」行下方，点击胶囊联动官方展开/收起。";
      }
      return undefined;
    }

    function createFoldEngine(diag) {
      const stripState = new WeakMap(); // strip -> 'folded' | 'open'
      const FOLDABLE_KINDS = new Set(["tool-call", "context"]);
      const disposers = [];
      let started = false;
      let scrollRestTimer = null;
      let scheduled = false;
      let queuedScan = null;
      let contract = detectFoldContract(document);

      // 工具卡片根元素可能带 data-tool(通用 ToolRow)或 data-sample(BashRow 等自定义视图)
      const capName = (name) => name.charAt(0).toUpperCase() + name.slice(1);
      const toolCardName = (el) => capName(el.getAttribute("data-tool") || el.getAttribute("data-sample") || "工具");
      const hasToolCard = (el) => el.querySelector("[data-tool]") !== null || el.querySelector("[data-sample]") !== null;
      const isStepMid = (el) => {
        if (el.getAttribute("data-chat-flow-kind") !== "assistant-step") return false;
        return el.querySelector('[data-variant="think"]') !== null || hasToolCard(el);
      };
      const isMidItem = (el) => el && el.nodeType === 1 && el.getAttribute && (FOLDABLE_KINDS.has(el.getAttribute("data-chat-flow-kind")) || isStepMid(el));
      const isRound = (el) => el && el.nodeType === 1 && el.classList && el.classList.contains("dsh-round");
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
        if (!started) return;
        for (const entry of entries) {
          const round = entry.target;
          for (const strip of round.querySelectorAll(':scope > .dsh-tool-strip[data-kind="tool"]')) layoutToolStrip(strip, false);
        }
      }) : null;
      const removeRound = (round) => {
        if (!round) return;
        if (toolStripResizeObserver) toolStripResizeObserver.unobserve(round);
        if (typeof round.remove === "function") round.remove();
      };
      // ---- 0.1.x：轮容器插在段首成员之前，靠 previousElementSibling 反查去重 ----
      const findRoundBefore = (flow, first) => {
        const prev = first.previousElementSibling;
        return (prev && prev.classList && prev.classList.contains("dsh-round")) ? prev : null;
      };
      const createRoundBefore = (flow, first) => {
        const round = document.createElement("div");
        round.className = "dsh-round";
        flow.insertBefore(round, first);
        if (toolStripResizeObserver) toolStripResizeObserver.observe(round);
        return round;
      };
      // ---- 0.2.0：轮容器插在 turn-process 行之后，官方分组之前（默认折叠态唯一可见落点） ----
      const findRoundAfter = (row) => {
        const next = row.nextElementSibling;
        return (next && next.classList && next.classList.contains("dsh-round") && next.dataset.dshHost === "turn-process") ? next : null;
      };
      const createRoundAfter = (row) => {
        const round = document.createElement("div");
        round.className = "dsh-round";
        round.dataset.dshHost = "turn-process";
        row.parentElement.insertBefore(round, row.nextElementSibling);
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
      /**
       * 通用渲染：host/items 只是「宿主 + 成员集合」，两种路径共用 segInfo()/buildHTML/layoutToolStrip。
       * processMode=true 时显隐交给官方，插件只同步胶囊自身的开合态，不再给成员加 .dsh-ec-*。
       */
      const renderSegment = (round, items, force, officialOpen, processMode) => {
        const info = segInfo(items);
        const groupKey = items.map((c) => c.getAttribute("data-chat-flow-key") || "").join("|");
        const hasThink = info.thinks > 0;
        const hasTools = info.tools.length > 0;
        if (!hasThink && !hasTools) {
          removeRound(round);
          return;
        }
        // 思考胶囊:仅当段内有思考时渲染
        if (hasThink) {
          const strip = stripInRound(round, "think") || createStripInRound(round, "think");
          const open = processMode ? officialOpen : stripState.get(strip) === "open";
          if (processMode) stripState.set(strip, open ? "open" : "folded");
          const keys = groupKey + ":t" + info.thinks + (info.thinkRunning ? "r" : "");
          if (force || strip.dataset.keys !== keys || strip.dataset.open !== (open ? "1" : "")) {
            strip.dataset.keys = keys;
            strip.dataset.open = open ? "1" : "";
            strip.setAttribute("aria-expanded", open ? "true" : "false");
            strip.innerHTML = buildThinkHtml(info, open);
            diag.rebuild += 1;
          }
          if (processMode) items.forEach((item) => { item.classList.remove("dsh-ec-think-open", "dsh-ec-tools-open", "dsh-ec-show"); });
          else items.forEach((item) => setThinkOpen(item, open));
        } else {
          const strip = stripInRound(round, "think");
          if (strip) { strip.remove(); stripState.delete(strip); }
          if (processMode) items.forEach((item) => { item.classList.remove("dsh-ec-think-open", "dsh-ec-tools-open", "dsh-ec-show"); });
          else items.forEach((item) => setThinkOpen(item, false));
        }
        // 工具胶囊:仅当段内有工具调用时渲染
        if (hasTools) {
          const strip = stripInRound(round, "tool") || createStripInRound(round, "tool");
          const open = processMode ? officialOpen : stripState.get(strip) === "open";
          if (processMode) stripState.set(strip, open ? "open" : "folded");
          const keys = groupKey + ":u" + info.tools.length;
          if (force || strip.dataset.keys !== keys || strip.dataset.open !== (open ? "1" : "")) {
            strip.dataset.keys = keys;
            strip.dataset.open = open ? "1" : "";
            strip.setAttribute("aria-expanded", open ? "true" : "false");
            strip.innerHTML = buildToolsHtml(info, open);
            layoutToolStrip(strip, true);
            diag.rebuild += 1;
          }
          if (processMode) items.forEach((item) => { item.classList.remove("dsh-ec-think-open", "dsh-ec-tools-open", "dsh-ec-show"); });
          else items.forEach((item) => setToolsOpen(item, open));
        } else {
          const strip = stripInRound(round, "tool");
          if (strip) { strip.remove(); stripState.delete(strip); }
          if (processMode) items.forEach((item) => { item.classList.remove("dsh-ec-think-open", "dsh-ec-tools-open", "dsh-ec-show"); });
          else items.forEach((item) => setToolsOpen(item, false));
        }
      };
      const applySegment = (flow, items, force) => {
        const first = items[0];
        if (!first) return;
        const round = findRoundBefore(flow, first) || createRoundBefore(flow, first);
        renderSegment(round, items, force, false, false);
      };
      // ---- 0.2.0：按 turn 聚合 ----
      const rowKeyOf = (row) => row.getAttribute("data-chat-node-key") || row.getAttribute("data-chat-flow-key") || row.getAttribute("data-chat-turn") || "";
      const officialButtonOf = (row) => row.querySelector('button[data-turn-process]');
      const officialIsOpen = (row) => {
        const button = officialButtonOf(row);
        return button !== null && button.hasAttribute("data-open");
      };
      const groupsOfRow = (row) => {
        const turn = row.getAttribute("data-chat-turn");
        const groups = [];
        if (turn !== null) {
          // data-chat-turn 在 ChatNodeSeat / ChatGroupSeat 两边都落，是官方契约里最稳的映射键
          document.querySelectorAll("[data-chat-group-key]").forEach((root) => {
            if (root.getAttribute("data-chat-turn") === turn) groups.push(root);
          });
          return groups;
        }
        // 契约兜底：turn 属性缺失时，沿兄弟节点取紧邻其后的过程分组（到下一个非分组节点为止）
        let n = row.nextElementSibling;
        while (n) {
          if (n.classList && n.classList.contains("dsh-round")) { n = n.nextElementSibling; continue; }
          if (n.getAttribute && n.getAttribute("data-chat-group-key") !== null) {
            groups.push(n);
            n = n.nextElementSibling;
            continue;
          }
          break;
        }
        return groups;
      };
      const membersOfGroups = (groups) => {
        const items = [];
        for (const root of groups) {
          const content = root.querySelector("[data-step-process-content]");
          if (!content) continue;
          for (const child of content.children) {
            if (isRound(child)) continue;
            if (isMidItem(child)) items.push(child);
          }
        }
        return items;
      };
      const applyTurnProcess = (row, items, force) => {
        const existing = findRoundAfter(row);
        if (items.length === 0) {
          if (existing) removeRound(existing);
          return;
        }
        const round = existing || createRoundAfter(row);
        round.dataset.dshHost = "turn-process";
        round.dataset.dshRowKey = rowKeyOf(row);
        renderSegment(round, items, force, officialIsOpen(row), true);
      };
      const groupOf = (strip) => {
        const round = strip.parentElement;
        if (!round) return { mode: "legacy", items: [] };
        if (round.dataset.dshHost === "turn-process") {
          const row = round.previousElementSibling;
          if (row && row.getAttribute && row.getAttribute("data-chat-flow-kind") === "turn-process") {
            return { mode: "turn-process", row, items: membersOfGroups(groupsOfRow(row)) };
          }
          return { mode: "turn-process", row: null, items: [] };
        }
        const flow = round.parentElement;
        const items = [];
        let n = round.nextElementSibling;
        while (n && isMidItem(n)) { items.push(n); n = n.nextElementSibling; }
        return { mode: "legacy", flow, items };
      };
      const scanFlow = (flow, force) => {
        // 清理孤儿轮容器:其后既无中间节点也无其他轮容器(段被 React 移除),才删除。
        // 0.2.0 的 turn-process 轮容器不归本函数管，留 process 路径清理。
        for (const round of flow.querySelectorAll(":scope > .dsh-round")) {
          if (round.dataset.dshHost === "turn-process") continue;
          const next = round.nextElementSibling;
          if (!isMidItem(next) && !isRound(next)) removeRound(round);
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
      const scanLegacyFlows = (force) => {
        document.querySelectorAll("[data-chat-flow]").forEach((flow) => {
          // 0.2.0 的分组内容自身也带 data-chat-flow，跳过它：成员由 process 路径跨组收集
          if (flow.getAttribute && flow.getAttribute("data-step-process-content") !== null) return;
          scanFlow(flow, force);
        });
      };
      const scanProcessRows = (force) => {
        const rows = Array.from(document.querySelectorAll('[data-chat-flow-kind="turn-process"]'));
        const rowKeys = new Set();
        for (const row of rows) {
          rowKeys.add(rowKeyOf(row));
          applyTurnProcess(row, membersOfGroups(groupsOfRow(row)), force);
        }
        // 反收残骸：React 把官方行重排后，挂在行后的胶囊若不再紧邻/键不匹配就删掉
        for (const round of Array.from(document.querySelectorAll('.dsh-round[data-dsh-host="turn-process"]'))) {
          const row = round.previousElementSibling;
          const key = round.dataset.dshRowKey || "";
          const alive = row && row.getAttribute && row.getAttribute("data-chat-flow-kind") === "turn-process" && rowKeys.has(key);
          if (!alive) removeRound(round);
        }
      };
      const scanAll = (force) => {
        if (!started) return;
        const next = detectFoldContract(document);
        if (next.mode !== contract.mode || next.supported !== contract.supported) contract = next;
        if (!contract.supported) {
          // 契约失配：不生成不可见节点，已生成的也一并收回
          document.querySelectorAll(".dsh-round").forEach(removeRound);
          return;
        }
        scanLegacyFlows(force);
        if (contract.mode === "process-groups") scanProcessRows(force);
      };
      const queueScan = (delay) => {
        if (!started) return;
        clearTimeout(queuedScan);
        queuedScan = setTimeout(() => {
          queuedScan = null;
          if (!started) return;
          diag.scan += 1;
          scanAll(false);
        }, delay);
      };
      const toggleOfficial = (row, open) => {
        const button = officialButtonOf(row);
        if (!button || button.disabled) return;
        if (button.hasAttribute("data-open") !== open) button.click();
        // React 的状态提交是异步的；立刻排队重扫一次，attribute 观察器也会兜底
        queueScan(160);
      };
      const onStripToggle = (strip, open) => {
        const round = strip.parentElement;
        const processMode = round !== null && round.dataset.dshHost === "turn-process";
        if (processMode) {
          stripState.set(strip, open ? "open" : "folded");
          const row = round.previousElementSibling;
          if (row && row.getAttribute && row.getAttribute("data-chat-flow-kind") === "turn-process") toggleOfficial(row, open);
          return;
        }
        stripState.set(strip, open ? "open" : "folded");
        const { flow, items } = groupOf(strip);
        if (items.length > 0) applySegment(flow, items);
      };
      const onDocClick = (event) => {
        const target = event.target;
        if (!target || typeof target.closest !== "function") return;
        const strip = target.closest(".dsh-tool-strip");
        if (!strip) return;
        if (target.closest(".dsh-tool-collapse")) { onStripToggle(strip, false); return; }
        const processMode = strip.parentElement !== null && strip.parentElement.dataset.dshHost === "turn-process";
        // 0.2.0 下官方状态是唯一事实源：点胶囊即联动官方开/关；0.1.x 维持“点开、▴ 收起”
        if (processMode) onStripToggle(strip, strip.dataset.open !== "1");
        else if (strip.dataset.open !== "1") onStripToggle(strip, true);
      };
      const onDocKeydown = (event) => {
        const target = event.target;
        if (!target || typeof target.closest !== "function") return;
        if (event.key !== "Enter" && event.key !== " ") return;
        const strip = target.closest(".dsh-tool-strip");
        if (!strip) return;
        event.preventDefault();
        // 0.1.x 与 0.2.0 的开关事实源不同，但键盘语义都是 toggle：交给同一入口处理
        onStripToggle(strip, strip.dataset.open !== "1");
      };
      // 只处理与折叠分组相关的变化:flow 直接子层增删、分组根/官方开合属性变化、think/工具元素出现
      // (忽略卡片内部渲染如终端输出逐行插入、文本流式,避免高频扫描与重建)
      const relevantMutation = (m) => {
        const target = m.target;
        // 用 nodeType 而不是 instanceof Element：测试 VM / 老内核里全局 Element 可能缺
        if (!target || target.nodeType !== 1) return false;
        if (m.type === "attributes") {
          const name = m.attributeName;
          if (name !== "hidden" && name !== "data-open" && name !== "aria-expanded") return false;
          return target.closest("[data-chat-flow]") !== null || target.hasAttribute("data-chat-flow-kind") !== false;
        }
        if (m.type !== "childList") return false;
        if (target.closest("[data-chat-flow]") === null) return false;
        if (target === target.closest("[data-chat-flow]")) return true;
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.getAttribute && (node.getAttribute("data-chat-flow-kind") !== null || node.hasAttribute("data-tool") || node.hasAttribute("data-variant"))) return true;
        }
        return false;
      };
      let scrollPending = false;
      const onDocScroll = () => {
        scrollPending = true;
        clearTimeout(scrollRestTimer);
        scrollRestTimer = setTimeout(() => {
          scrollPending = false;
          scanAll(false);
        }, 120);
      };
      const observer = new MutationObserver((mutations) => {
        if (!started) return;
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
          if (!started) return;
          diag.scan += 1;
          scanAll(false);
        });
      });

      /** 挂上监听/观察器并做一次全量扫描。重复调用安全（幂等）。 */
      function start() {
        if (started) return;
        started = true;
        document.addEventListener("click", onDocClick);
        document.addEventListener("keydown", onDocKeydown);
        document.addEventListener("scroll", onDocScroll, { capture: true, passive: true });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["hidden", "data-open", "aria-expanded"],
        });
        disposers.push(() => document.removeEventListener("click", onDocClick));
        disposers.push(() => document.removeEventListener("keydown", onDocKeydown));
        disposers.push(() => document.removeEventListener("scroll", onDocScroll, { capture: true }));
        disposers.push(() => observer.disconnect());
        disposers.push(() => clearTimeout(scrollRestTimer));
        disposers.push(() => clearTimeout(queuedScan));
        scanAll(false);
      }

      /**
       * 摘掉监听/观察器，并把注入的 DOM 收回：轮容器删掉、展开类名去掉。
       * 官方消息节点本身没被动过，所以关掉后立刻回到官方渲染。
       */
      function stop() {
        if (!started) return;
        started = false;
        for (const dispose of disposers.splice(0).reverse()) dispose();
        scrollPending = false;
        scheduled = false;
        clearTimeout(queuedScan);
        queuedScan = null;
        document.querySelectorAll(".dsh-round").forEach(removeRound);
        document.querySelectorAll(".dsh-ec-show, .dsh-ec-think-open, .dsh-ec-tools-open").forEach((el) => {
          el.classList.remove("dsh-ec-show", "dsh-ec-think-open", "dsh-ec-tools-open");
        });
      }

      return { start, stop, scanAll, isStarted: () => started, contract: () => ({ ...contract }) };
    }

    /* ==========================================================================
       设置页：settings.section「界面增强」
       ========================================================================== */

    /**
     * 官方 UI 组件库由壳作为「平台种子」模块提供（dsh-web-frontend 的 staticModules 表里
     * 列了 @deepseek-ai/dsh-client-ui-primitives，与 react / react-dom 同级）。
     * 取到就用官方 Switch —— 观感、焦点环、无障碍语义与设置页其它行逐像素一致；
     * 取不到（未来某版不再把它列为种子）就退回自带实现，度量抄自官方 Switch.module.css。
     * 平台种子走的是 require 的 seed 分支，不需要在 dsh.client 里声明，也不进模块图。
     */
    const PRIMITIVES = (() => {
      try {
        return require("@deepseek-ai/dsh-client-ui-primitives");
      } catch (_) {
        return null;
      }
    })();
    const OfficialSwitch = PRIMITIVES !== null && typeof PRIMITIVES.Switch === "function" ? PRIMITIVES.Switch : null;

    function SwitchCell({ checked, disabled, label, onChange }) {
      if (OfficialSwitch !== null) {
        return React.createElement(OfficialSwitch, {
          checked: checked,
          disabled: disabled === true,
          label: label,
          title: label,
          onChange: onChange,
        });
      }
      return React.createElement("button", {
        type: "button",
        role: "switch",
        "aria-checked": checked,
        "aria-label": label,
        title: label,
        disabled: disabled === true,
        className: "dshx-switch",
        onClick: () => onChange(!checked),
      }, React.createElement("span", { className: "dshx-switch-thumb" }));
    }

    function FeatureRow({ title, desc, note, checked, disabled, onChange }) {
      return React.createElement("div", { className: "dshx-row" + (disabled ? " dshx-row-off" : "") },
        React.createElement("div", { className: "dshx-main" },
          React.createElement("div", { className: "dshx-title" }, title),
          React.createElement("div", { className: "dshx-desc" }, desc),
          note !== undefined && React.createElement("div", { className: "dshx-note" }, note)),
        React.createElement(SwitchCell, { checked: checked, disabled: disabled, label: title, onChange: onChange }));
    }

    /** 多选一：一排小胶囊（方案/字重这类枚举用）。放不下会自动换行。 */
    function ChoiceRow({ title, desc, note, options, value, disabled, onSelect, extra }) {
      return React.createElement("div", { className: "dshx-choice" + (disabled ? " dshx-row-off" : "") },
        React.createElement("div", { className: "dshx-main" },
          React.createElement("div", { className: "dshx-title" }, title),
          React.createElement("div", { className: "dshx-desc" }, desc)),
        React.createElement("div", { className: "dshx-pills" },
          options.map((option) => React.createElement("button", {
            key: option.key,
            type: "button",
            className: "dshx-pill" + (option.key === value ? " dshx-pill-on" : ""),
            "aria-pressed": option.key === value,
            disabled: disabled === true || option.disabled === true,
            title: option.hint,
            onClick: () => onSelect(option.key),
          },
            React.createElement("span", null, option.label),
            option.badge !== undefined && React.createElement("span", { className: "dshx-pill-badge" }, option.badge)))),
        note !== undefined && React.createElement("div", { className: "dshx-note" }, note),
        extra);
    }

    /**
     * 对齐自检块（文章 §5 的校验文本，按 2:1 校齐了列宽）：
     *   第 1 行 40 个半角字符 = 第 2 行 20 个汉字（20×2=40 列），能对齐就说明方案是对的；
     *   第 3 行全是东亚歧义字符：Mono 方案下应与第 1 行等宽，Term 方案下只有一半 ——
     *   这正是 Mono 与 Term 的唯一差别；
     *   方框四行都按 42 列算好（框线本身恒为 1 格），渲染出来是矩形就说明汉字没被拉宽。
     * （文章原样例的汉字行是 21 字，与 40 列的数字行对不上，这里改成严格 2:1 的版本。）
     */
    const ALIGN_SAMPLE = [
      "0123456789012345678901234567890123456789",
      "一二三四五六七八九十一二三四五六七八九十",
      // 20 个东亚歧义字符（U+2014 中文破折号 + U+2026 省略号）：
      // Sarasa Mono 下每个占 2 格 → 40 列，与第 1 行等宽；Sarasa Term 下每个占 1 格 → 20 列。
      // 用转义写死码点：破折号 U+2014 与制表横线 U+2500 长得几乎一样，手输极易混。
      "\u2014\u2014\u2026\u2026".repeat(5),
      "\u250C" + "\u2500".repeat(40) + "\u2510",
      "\u2502 状态: 正常  [##########..........] 70% \u2502",
      "\u2514" + "\u2500".repeat(40) + "\u2518",
    ].join("\n");

    function AlignSample() {
      return React.createElement("div",
        { className: "dshx-grid", title: "校验块：第 1 行 40 个半角字符与第 2 行 20 个汉字必须等宽；方框必须是矩形" },
        ALIGN_SAMPLE);
    }

    /** 本机字体探测结果（一次会话只探一次）。 */
    function useDetectedSchemes() {
      return React.useMemo(() => {
        const available = detectSchemes();
        const autoPick = FONT_SCHEMES[0].families.find((family) => familyInstalled(family));
        return { available: available, autoPick: autoPick };
      }, []);
    }

    function FontSchemeRow({ state, detected, disabled }) {
      const options = FONT_SCHEMES.map((scheme) => {
        const available = detected.available[scheme.key] !== false;
        const badge = scheme.key === "auto"
          ? (detected.autoPick === undefined ? "未检测到" : detected.autoPick)
          : available ? undefined : "未安装";
        return {
          key: scheme.key,
          label: scheme.label,
          hint: scheme.hint + (available || scheme.key === "auto" ? "" : "（本机未安装，装了字体再回来即可，无需重启）"),
          badge: badge,
          disabled: !available,
        };
      });
      const note = React.createElement("span", null,
        "中文优先：汉字是不可妥协的 1.0 正方，西文必须收窄到 0.5，两个西文字符才严丝合缝等于一个汉字。",
        "本机检测：", FONT_SCHEMES.filter((s) => s.key !== "off" && s.key !== "auto").map((s) => s.label + (detected.available[s.key] ? " ✓" : " ✗") + "  ").join(""),
        detected.autoPick === undefined ? "（自动方案没有命中任何一款，会落回官方字体栈）" : "（自动会选 " + detected.autoPick + "）");
      return React.createElement(ChoiceRow, {
        title: "字体方案（中文优先 / 0.5 窄体西文）",
        desc: "西文 0.6~0.67 的编程字体（Menlo、Maple Mono…）会把汉字撑到 1.2 宽，汉字被横向拉扁；更纱黑体用 Iosevka 的 0.5 西文配思源黑体的 1.0 汉字，2:1 严格成立。",
        options: options,
        value: state.font,
        disabled: disabled,
        onSelect: (key) => store.set("font", key),
        note: note,
        extra: disabled || state.font === "off" ? undefined : React.createElement(AlignSample, null),
      });
    }

    function FontWeightRow({ state, disabled }) {
      return React.createElement(ChoiceRow, {
        title: "字重",
        desc: "文章 §3：宁可用字族自带的矢量字重，不要算法级伪粗 —— 伪粗是光栅化阶段向外描边，会挤占字怀、笔画黏连。这里同时关掉 font-synthesis。",
        options: FONT_WEIGHTS.map((weight) => ({ key: weight.key, label: weight.label, hint: weight.hint, badge: weight.key === "semibold" ? "推荐" : undefined })),
        value: state.fontweight,
        disabled: disabled,
        onSelect: (key) => store.set("fontweight", key),
        note: "标准＝正文 400／强调 500（官方层级）；半粗＝正文 600／强调 700（SemiBold 是正文甜点位）。",
      });
    }

    /**
     * 文字墨色：配色管「底」，这里管「字」。
     * 只作用于浅色、只改文字 token，不碰背景与品牌色；按钮主色上的反白字
     * （--dsw-alias-label-primary-foreground）也不动，否则按钮文字会翻黑。
     */
    function InkSchemeRow({ state, disabled }) {
      return React.createElement(ChoiceRow, {
        title: "文字墨色",
        desc: "决定正文字色跟配色走，还是更深/全黑。只改文字，不动背景与品牌色；浅色下生效，深色配色保持各自默认。",
        options: INK_SCHEMES.map((scheme) => ({
          key: scheme.key,
          label: scheme.label,
          hint: scheme.hint,
          badge: scheme.key === "deep" ? "推荐" : undefined,
        })),
        value: state.ink,
        disabled: disabled,
        onSelect: (key) => store.set("ink", key),
        note: "深墨统一用暖青黑 #002b36（Solarized base03），比浅色主题的默认墨色深一档：Solarized 上正文对 layer-1 从 4.39:1 提到 12.2:1。纯黑用于强光/低视力；深色主题不使用这一档。",
      });
    }

    /**
     * 探测宿主半：`/enh/ping` 是否在、报出的构建号是什么。
     * 用 text() 而不是 json()：宿主半缺席时可能返回 404，也可能回落到前端页面(200 + HTML)，
     * 后者直接 json() 只会抛出 "Unexpected token '<'"，说不清发生了什么。
     * 抽成纯函数是为了能在 test/smoke.mjs 里用假的 fetch 覆盖四种响应。
     * @returns Promise<{phase:'ok',build:string} | {phase:'missing',message:string}>
     */
    function probeHost(fetchImpl) {
      return fetchImpl("/enh/ping", { cache: "no-store" })
        .then((response) => response.text().then((text) => ({ ok: response.ok, status: response.status, text: text })))
        .then((result) => {
          if (!result.ok) throw new Error("HTTP " + result.status);
          let body = null;
          try {
            body = JSON.parse(result.text);
          } catch (_) {
            throw new Error("HTTP " + result.status + " 返回的不是 JSON（疑似回落到前端页面）");
          }
          if (body === null || typeof body.build !== "string") throw new Error("响应缺少 build 字段（宿主半版本过旧）");
          return { phase: "ok", build: body.build };
        })
        .catch((error) => ({ phase: "missing", message: String((error && error.message) || error) }));
    }

    function HostStatusRow() {
      const [status, setStatus] = React.useState({ phase: "checking" });
      const check = React.useCallback(() => {
        setStatus({ phase: "checking" });
        probeHost(fetch).then(setStatus);
      }, []);
      React.useEffect(() => { check(); }, [check]);
      const synced = status.phase === "ok" && status.build === CLIENT_BUILD;
      const level = synced ? "ok" : status.phase === "checking" ? "ok" : "warn";
      let body;
      if (status.phase === "checking") {
        body = React.createElement("span", null, "正在核对宿主半与客户端半的构建号…");
      } else if (synced) {
        body = React.createElement("span", null,
          "宿主半已同步（构建 ", React.createElement("b", null, String(status.build)), "）。所有开关即时生效，",
          React.createElement("b", null, "无需重启"), "。");
      } else if (status.phase === "ok") {
        body = React.createElement("span", null,
          "客户端半已更新到 ", React.createElement("b", null, CLIENT_BUILD), "，但宿主半仍是 ", React.createElement("b", null, String(status.build)),
          " —— 配色首帧、余额与用量接口要等宿主半跟上。请", React.createElement("b", null, "退出并重新打开 DeepSeek Harness"), "（或在插件页重装 dsh）后生效。");
      } else {
        body = React.createElement("span", null,
          "宿主半没跟上：/enh/ping 返回 ", React.createElement("b", null, String(status.message)),
          "（多半是插件刚更新、进程里还是旧版宿主半，或宿主半未加载）。页面里的开关照常即时生效；余额与用量、以及首帧配色要等进程重启后才完整。请",
          React.createElement("b", null, "退出并重新打开 DeepSeek Harness"), " —— 宿主半由 dsh 进程在启动时加载，无法热更新。");
      }
      return React.createElement("div", { className: "dshx-banner", "data-level": level },
        React.createElement("div", null, body),
        React.createElement("button", { type: "button", className: "dshx-btn", onClick: check, disabled: status.phase === "checking" }, "重新检测"));
    }

    /**
     * 设置页顶部的 Star 入口。
     * 纯客户端、无状态：不写 cookie、不加宿主接口，点一下把用户送到浏览器里的仓库页。
     * 桌面壳的 setWindowOpenHandler 会把 https 链接交给系统浏览器（与余额面板的「查看官方页面」同一路径）。
     */
    function StarRow() {
      return React.createElement("div", { className: "dshx-star" },
        React.createElement("svg", {
          className: "dshx-star-icon",
          viewBox: "0 0 16 16",
          width: 16,
          height: 16,
          "aria-hidden": "true",
          focusable: "false",
        }, React.createElement("path", {
          fill: "currentColor",
          d: "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z",
        })),
        React.createElement("div", { className: "dshx-star-text" },
          React.createElement("b", null, "dsh-uxexo 由江南泉个人开发并免费开源。"),
          React.createElement("br"),
          "如果它帮到了你，去 GitHub 点个 Star 就是最好的支持。"),
        React.createElement("a", {
          className: "dshx-star-btn",
          href: REPO_URL,
          target: "_blank",
          rel: "noreferrer noopener",
          title: "在浏览器中打开 GitHub 仓库",
        }, "去 GitHub 点赞", React.createElement("span", { "aria-hidden": "true" }, "↗")));
    }

    /* 主题按「官方 / 经典 CRT / 纸面浅色 / 现代 / AI 品牌」分组，供下拉的 optgroup 用。 */
    const THEME_GROUPS = (() => {
      const groups = [];
      for (const theme of THEMES) {
        let group = groups.find((g) => g.title === theme.group);
        if (group === undefined) { group = { title: theme.group, items: [] }; groups.push(group); }
        group.items.push(theme);
      }
      return groups;
    })();

    /**
     * 配色主题：一个下拉 + 当前主题的三色预览（底 / 字 / 强调）。
     * 25 套主题不适合铺成胶囊墙；下拉的 optgroup 正好对应三部曲的四个谱系。
     */
    function ThemeRow({ state, disabled }) {
      const current = THEME_MAP.get(state.theme) ?? THEME_MAP.get(DEFAULT_THEME);
      return React.createElement("div", { className: "dshx-choice" + (disabled ? " dshx-row-off" : "") },
        React.createElement("div", { className: "dshx-main" },
          React.createElement("div", { className: "dshx-title" }, "配色主题"),
          React.createElement("div", { className: "dshx-desc" },
            "取自江南泉《终端美学》三部曲：经典 CRT、纸面浅色、现代双生、AI 品牌，共 " + (THEMES.length - 1) + " 套。"),
          React.createElement("div", { className: "dshx-select-wrap" },
            React.createElement("select", {
              className: "dshx-select",
              value: state.theme,
              disabled: disabled,
              "aria-label": "配色主题",
              onChange: (event) => store.set("theme", event.target.value),
            },
              THEME_GROUPS.map((group) => React.createElement("optgroup", { key: group.title, label: group.title },
                group.items.map((theme) => React.createElement("option", { key: theme.key, value: theme.key }, theme.label))))),
            React.createElement("span", { className: "dshx-swatches", "aria-hidden": "true" },
              React.createElement("span", { className: "dshx-swatch", style: { background: current.bg } }),
              React.createElement("span", { className: "dshx-swatch", style: { background: current.fg } }),
              React.createElement("span", { className: "dshx-swatch", style: { background: current.accent } })))),
        React.createElement("div", { className: "dshx-note" },
          current.note + "。" + (current.tone === "dark" ? "深色主题自动使用配色自带的墨色。" : "")));
    }

    function SettingsPage() {
      const state = useStore();
      const detected = useDetectedSchemes();
      const foldNote = state.master && state.fold ? foldContractNote(document) : undefined;
      const groups = [];
      for (const feature of FEATURES) {
        let group = groups.find((g) => g.title === feature.group);
        if (group === undefined) { group = { title: feature.group, items: [] }; groups.push(group); }
        group.items.push(feature);
      }
      const appearance = groups.find((g) => g.title === "外观");
      const children = [
        React.createElement(StarRow, { key: "star" }),
        React.createElement("div", { key: "banner" }, React.createElement(HostStatusRow, null)),
        React.createElement(FeatureRow, {
          key: "master",
          title: "启用 dsh-uxexo 界面增强",
          desc: "总开关。关掉后整层增强立即撤下，回到官方外观；各分项的选择保留，下次打开时按原样恢复。",
          checked: state.master,
          onChange: (value) => store.set("master", value),
        }),
      ];
      // 外观组顺序：配色主题 → 新会话按钮弱化 → 字体方案 → 文字墨色 → 字重
      children.push(React.createElement("div", { key: "g-外观", className: "dshx-group" }, "外观"));
      children.push(React.createElement(ThemeRow, {
        key: "theme",
        state: state,
        disabled: !state.master,
      }));
      // 主题相关的布尔开关（当前只有「新会话按钮弱化」）紧跟配色主题，符合阅读顺序
      if (appearance !== undefined) {
        for (const feature of appearance.items) {
          children.push(React.createElement(FeatureRow, {
            key: feature.key,
            title: feature.title,
            desc: feature.desc,
            checked: state.master && state[feature.key],
            disabled: !state.master,
            onChange: (value) => store.set(feature.key, value),
          }));
        }
      }
      children.push(React.createElement(FontSchemeRow, {
        key: "font-scheme",
        state: state,
        detected: detected,
        disabled: !state.master,
      }));
      children.push(React.createElement(InkSchemeRow, {
        key: "ink-scheme",
        state: state,
        disabled: !state.master || THEME_TONES[state.theme] === "dark",
      }));
      children.push(React.createElement(FontWeightRow, {
        key: "font-weight",
        state: state,
        disabled: !state.master || state.font === "off",
      }));
      for (const group of groups) {
        if (group.title === "外观") continue;
        children.push(React.createElement("div", { key: "g-" + group.title, className: "dshx-group" }, group.title));
        for (const feature of group.items) {
          children.push(React.createElement(FeatureRow, {
            key: feature.key,
            title: feature.title,
            desc: feature.desc,
            note: feature.key === "fold" ? foldNote : undefined,
            checked: state.master && state[feature.key],
            disabled: !state.master,
            onChange: (value) => store.set(feature.key, value),
          }));
        }
      }
      children.push(React.createElement("div", { key: "foot", className: "dshx-foot" },
        React.createElement("span", null, "dsh-uxexo v" + CLIENT_BUILD + " · 配置存在本机 cookie，随开关即时写入"),
        React.createElement("button", {
          type: "button",
          className: "dshx-btn",
          onClick: () => store.setAll(),
        }, "全部恢复默认")));
      return React.createElement("div", { className: "dshx-page" }, children);
    }

    function apply(ctx) {
      // —— 文档级副作用登记 ——
      // 客户端热重载会先 dispose 旧实例、再跑新包(factory 被 invalidate 后重新执行),
      // 所以监听器/观察器/定时器必须挂在插件 fiber 上,否则每轮热重载都叠一份。
      // 样式标签不用手动登记:client-modules 卸载时会按 data-plugin 扫掉
      // (removeOwnedStyles),这里只做幂等 upsert,防的是历史残留与「重放时留下旧 CSS」。
      const disposers = [];
      const injectCss = (text) => {
        const tags = document.querySelectorAll('style[data-plugin-css="dsh-uxexo"]');
        const style = tags[0] || document.createElement("style");
        for (let i = 1; i < tags.length; i += 1) tags[i].remove();
        style.dataset.plugin = "dsh-uxexo";
        style.dataset.pluginCss = "dsh-uxexo";
        style.textContent = text;
        if (!style.isConnected) document.head.appendChild(style);
      };
      // 字体层永远注入：它整体挂在 data-dsh-ux-font 闸门下，方案与字重都只改属性。
      // 家族栈里列出的是候选族名，装没装由浏览器的字体回退决定 —— 不需要按机器裁剪 CSS。
      injectCss(CSS + FONT_CSS);

      // 法定节假日每年由国务院发布一次：启动即拉当年 + 次年，6 小时刷新一轮；
      // 拉不到就继续用内置 2026 兜底，不影响任何开关。
      disposers.push(startHolidayCalendar());

      // 状态 -> 副作用：属性/持久化由 store 自己做，这里只负责有生命周期的部分
      const diag = { scan: 0, rebuild: 0 };
      const engine = createFoldEngine(diag);
      let diagTimer = null;
      const syncFeatures = () => {
        const state = store.get();
        if (state.master && state.fold) engine.start();
        else engine.stop();
        if (state.master && DIAG_ON) {
          if (diagTimer === null) {
            diagTimer = setInterval(() => {
              console.debug("[dsh-uxexo-diag] scan/5s=" + diag.scan + " rebuild/5s=" + diag.rebuild + " strips=" + document.querySelectorAll(".dsh-tool-strip").length);
              diag.scan = 0;
              diag.rebuild = 0;
            }, 5000);
          }
        } else if (diagTimer !== null) {
          clearInterval(diagTimer);
          diagTimer = null;
        }
      };
      // 首帧属性由 host 注入脚本写过；这里再写一次，保证「客户端比宿主半新」时也能对齐，
      // 顺便把 store 的初始值落到属性上（两边同源）。持久化一次把 v1→v2 迁移写回 cookie，
      // 否则下次刷新宿主半的首帧脚本还会按旧默认画一帧。
      applyStateToDom(store.get());
      persistState(store.get());
      syncFeatures();
      disposers.push(store.subscribe(syncFeatures));
      disposers.push(() => { if (diagTimer !== null) { clearInterval(diagTimer); diagTimer = null; } });
      disposers.push(() => engine.stop());
      // 卸载时把闸门属性摘掉：插件被移除后不该继续留着一层没样式支撑的状态
      disposers.push(() => clearStateFromDom());

      // 统一挂到插件 fiber:热重载/卸载时官方先跑 effect 清理再跑新包,否则上面这些
      // 订阅、观察器、定时器会一轮一轮叠下去。必须在 slots 的提前 return 之前登记。
      ctx.effect(() => () => {
        for (const dispose of disposers.reverse()) dispose();
      }, "dsh-uxexo: runtime lifecycle");

      const slots = ctx.get("slots");
      if (slots === undefined) return;
      // 整插件一个设置页：注册成 settings.section，在设置面板左侧栏占一格。
      // （官方 settings.general.item 是「通用设置」里的一行，本插件不再占用它。）
      slots.inject("settings.section", () => slots.register(
        { name: "settings.section", id: "dsh-uxexo", order: 30, label: "界面增强" },
        () => React.createElement(SettingsPage),
      ));
      slots.inject("conversation.composer.dock", () => slots.register(
        { name: "conversation.composer.dock", id: "dsh-uxexo-dock", order: 1 },
        (props) => React.createElement(DockCell, props),
      ));
      slots.inject("shell.overlay", () => slots.register(
        { name: "shell.overlay", id: "dsh-uxexo-usage", order: 10 },
        () => React.createElement(UsageOverlay),
      ));
      slots.inject("shell.overlay", () => slots.register(
        { name: "shell.overlay", id: "dsh-uxexo-session-usage", order: 11 },
        () => React.createElement(SessionOverlay),
      ));
    }

    exports.apply = apply;
    // 客户端服务依赖：slots 由 ui-renderer 的客户端半边 provide（dsh 0.1 与 0.2 同名）。
    // 不声明会在 slots 就绪前 apply，此时 ctx.get("slots") 为 undefined 而整段 UI 静默失效。
    exports.inject = ["slots"];
    // 测试钩子（test/smoke.mjs 用；运行时不读）：纯函数与常量，无渲染副作用。
    exports.__internals = {
      CLIENT_BUILD,
      FEATURES,
      BOOL_KEYS,
      ENUM_KEYS,
      DEFAULT_STATE,
      CONFIG_COOKIE,
      LEGACY_THEME_COOKIE,
      REPO_URL,
      FONT_SCHEMES,
      FONT_SCHEME_KEYS,
      FONT_WEIGHTS,
      FONT_WEIGHT_KEYS,
      INK_SCHEMES,
      INK_SCHEME_KEYS,
      THEMES,
      THEME_KEYS,
      THEME_GROUPS,
      THEME_TONES,
      DEFAULT_THEME,
      themeTokens,
      FONT_STACKS,
      ALIGN_SAMPLE,
      normalizeState,
      serializeState,
      parseState,
      readStateFromDom,
      readCookieState,
      initialState,
      applyStateToDom,
      clearStateFromDom,
      persistState,
      createStore,
      familyInstalled,
      schemeAvailable,
      detectSchemes,
      detectFoldContract,
      foldContractNote,
      SwitchCell,
      OfficialSwitch,
      AlignSample,
      FontSchemeRow,
      FontWeightRow,
      InkSchemeRow,
      StarRow,
      SettingsPage,
      probeHost,
      // 峰谷计费：纯函数，供测试与排障
      OFFICIAL_PROVIDERS,
      isOfficialProvider,
      pricingClock,
      pricingHint,
      pricingStateText,
      fmtGap,
      fmtBeijingTime,
      beijingParts,
      isPeakWindowMinute,
      isPeakDay,
      isPeakAt,
      isChinaHoliday,
      isWeekend,
      CN_HOLIDAYS: BUILTIN_CN_HOLIDAYS,
      BUILTIN_CN_HOLIDAYS,
      holidayState,
      applyHolidayCalendar,
      loadHolidayCalendar,
      resetHolidayCalendarForTest,
      PEAK_PRICING_EPOCH,
      WEEKEND_RULE_EPOCH,
      PRICING_DOC_URL,
      PricingPopover,
    };
    return module.exports;
  },
});
