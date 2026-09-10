import "clsx";
import { a6 as ssr_context, a7 as ensure_array_like, a8 as attr_class, a9 as attr, aa as attr_style, ab as stringify, e as escape_html, a5 as derived } from "../../chunks/index.js";
import { t as tileFor } from "../../chunks/sites.js";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
let nextId = 1;
const newTabId = () => `tab-${nextId++}`;
const tabs = [];
let activeId = "";
let history = [];
let bookmarks = [];
const session = { theme: "light" };
const browser = {
  get tabs() {
    return tabs;
  },
  get activeId() {
    return activeId;
  },
  get active() {
    return tabs.find((t) => t.id === activeId);
  },
  get history() {
    return history;
  },
  get bookmarks() {
    return bookmarks;
  },
  get session() {
    return session;
  },
  async init() {
    try {
      const s = await invoke("restore_session");
      history = s.history ?? [];
      bookmarks = s.bookmarks ?? [];
      session.theme = s.theme ?? "light";
      const tabsIn = s.tabs ?? [];
      if (tabsIn.length) {
        for (const t of tabsIn) this.openTab(t.url || "vela://start", t.id, { title: t.title, activate: t.id === s.activeId });
        if (!tabs.some((t) => t.id === activeId) && tabs.length) this.activate(tabs[0].id);
      } else {
        this.openTab("vela://start", void 0, { activate: true });
      }
    } catch {
      this.openTab("vela://start", void 0, { activate: true });
    }
  },
  // --- tabs -------------------------------------------------------------
  openTab(url, id, opts = {}) {
    const tab = {
      id: id || newTabId(),
      kind: url.startsWith("vela://") ? "start" : "page",
      title: opts.title || (url.startsWith("vela://") ? "New tab" : url),
      url,
      loading: url.startsWith("vela://") ? false : true,
      blocked: 0,
      crashed: false
    };
    tabs.push(tab);
    invokeSafe("create_webview_tab", { id: tab.id, url, activate: opts.activate !== false });
    if (opts.activate !== false) this.activate(tab.id);
    return tab;
  },
  activate(id) {
    activeId = id;
    invokeSafe("activate_tab", { id });
  },
  closeTab(id) {
    const i = tabs.findIndex((t) => t.id === id);
    if (i === -1) return;
    tabs.splice(i, 1);
    invokeSafe("close_tab", { id });
    if (activeId === id) {
      const next = tabs[Math.min(i, tabs.length - 1)];
      if (next) this.activate(next.id);
      else setTimeout(() => this.openTab("vela://start", void 0, { activate: true }), 0);
    }
  },
  // --- navigation -------------------------------------------------------
  navigate(id, raw) {
    const tab = tabs.find((t) => t.id === id);
    if (!tab) return;
    const url = normalizeUrl(raw);
    tab.url = url;
    tab.kind = url.startsWith("vela://") ? "start" : "page";
    tab.loading = tab.kind === "page";
    tab.crashed = false;
    tab.error = void 0;
    invokeSafe("load_in_tab", { id, url });
  },
  back(id) {
    invokeSafe("go_back", { id });
  },
  forward(id) {
    invokeSafe("go_forward", { id });
  },
  reload(id) {
    invokeSafe("reload_tab", { id });
  },
  // --- state updates from Rust ------------------------------------------
  onLoading(id, loading) {
    const tab = tabs.find((t) => t.id === id);
    if (tab) tab.loading = loading;
  },
  onLoaded(id, url, title) {
    const tab = tabs.find((t) => t.id === id);
    if (!tab) return;
    tab.url = url;
    if (url.startsWith("vela://")) {
      tab.kind = "start";
      tab.title = "New tab";
    } else {
      tab.kind = "page";
      if (title) tab.title = title;
      const entry = { url, title: title || url, at: Date.now() };
      history = [entry, ...history].slice(0, 500);
      invokeSafe("add_history", { entry });
    }
    tab.loading = false;
    tab.crashed = false;
    tab.error = void 0;
  },
  onTitle(id, title) {
    const tab = tabs.find((t) => t.id === id);
    if (tab && title) tab.title = title;
  },
  onUrl(id, url) {
    const tab = tabs.find((t) => t.id === id);
    if (tab) tab.url = url;
  },
  onBlocked(id, delta) {
    const tab = tabs.find((t) => t.id === id);
    if (tab) tab.blocked += delta;
  },
  onCrashed(id, msg) {
    const tab = tabs.find((t) => t.id === id);
    if (tab) {
      tab.crashed = true;
      tab.loading = false;
      tab.error = msg;
    }
  },
  // --- bookmarks / settings ----------------------------------------------
  isBookmarked() {
    const tab = this.active;
    return !!tab && tab.kind === "page" && bookmarks.some((b) => b.url === tab.url);
  },
  toggleBookmark() {
    const tab = this.active;
    if (!tab || tab.kind !== "page") return false;
    const i = bookmarks.findIndex((b2) => b2.url === tab.url);
    if (i >= 0) {
      bookmarks.splice(i, 1);
      invokeSafe("remove_bookmark", { url: tab.url });
      return false;
    }
    const b = { url: tab.url, title: tab.title, at: Date.now() };
    bookmarks.push(b);
    invokeSafe("add_bookmark", { bookmark: b });
    return true;
  },
  setTheme(theme) {
    session.theme = theme;
    invokeSafe("set_theme", { theme });
  },
  clearHistory() {
    history = [];
    invokeSafe("clear_history", {});
  }
};
function normalizeUrl(raw) {
  const input = raw.trim();
  if (!input) return "vela://start";
  if (input.startsWith("vela://")) return input;
  const hasPort = /^[\w.-]+:\d+/.test(input);
  const looksLikeUrl = /^https?:\/\//i.test(input) || /^[\w-]+(\.[\w-]+)+(:\d+)?(\/.*)?$/.test(input) || input.startsWith("localhost");
  if (looksLikeUrl && !input.includes(" ")) {
    if (/^https?:\/\//i.test(input)) return input;
    if (hasPort || input.startsWith("localhost")) return `http://${input}`;
    return `https://${input}`;
  }
  return `https://duckduckgo.com/?q=${encodeURIComponent(input)}`;
}
let tauriInvoke;
async function resolveInvoke() {
  if (tauriInvoke !== void 0) return tauriInvoke;
  try {
    const core = await import("@tauri-apps/api/core");
    tauriInvoke = core.invoke;
  } catch {
    tauriInvoke = null;
  }
  return tauriInvoke;
}
async function invoke(cmd, args) {
  const fn = await resolveInvoke();
  if (!fn) throw new Error("not running under Tauri");
  return fn(cmd, args);
}
async function invokeSafe(cmd, args) {
  try {
    await invoke(cmd, args);
  } catch {
  }
}
function TabRail($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="rail svelte-uvgx0j" data-tauri-drag-region=""><!--[-->`);
    const each_array = ensure_array_like(browser.tabs);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tab = each_array[$$index];
      $$renderer2.push(`<button${attr_class("tab svelte-uvgx0j", void 0, {
        "active": tab.id === browser.activeId,
        "crashed": tab.crashed
      })}${attr("title", tab.url)}><span class="tile mono svelte-uvgx0j"${attr_style(`background:${stringify(tileFor(tab.url).bg)};color:${stringify(tileFor(tab.url).fg)}`)}>${escape_html(tileFor(tab.url).label)}</span> <span class="t svelte-uvgx0j">${escape_html(tab.loading ? "Loading…" : tab.title)}</span> `);
      if (tab.blocked > 0) {
        $$renderer2.push(`<!--[0--><span class="shield mono svelte-uvgx0j"${attr("title", `${stringify(tab.blocked)} blocked on this tab`)}>⛨${escape_html(tab.blocked)}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <span class="x svelte-uvgx0j" role="button" tabindex="-1" aria-label="Close tab">✕</span></button>`);
    }
    $$renderer2.push(`<!--]--> <button class="new svelte-uvgx0j" aria-label="New tab">+</button></div>`);
  });
}
function Toolbar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let draft = "";
    let focused = false;
    window.addEventListener("vela:focus-omnibox", () => {
    });
    const active = derived(() => browser.active);
    const isStart = derived(() => !active() || active().kind === "start");
    $$renderer2.push(`<div class="bar svelte-1ld6r3r"><button class="nav svelte-1ld6r3r"${attr("disabled", isStart(), true)} aria-label="Back" title="Back (Alt+←)">◀</button> <button class="nav svelte-1ld6r3r"${attr("disabled", isStart(), true)} aria-label="Forward" title="Forward (Alt+→)">▶</button> <button class="nav svelte-1ld6r3r"${attr("disabled", isStart(), true)} aria-label="Reload" title="Reload">⟳</button> <div${attr_class("omni svelte-1ld6r3r", void 0, { "editing": focused })}>`);
    if (active() && active().blocked > 0) {
      $$renderer2.push(`<!--[0--><span class="omni-shield mono svelte-1ld6r3r"${attr("title", `${stringify(active().blocked)} requests blocked by the shield on this tab`)}>⛨${escape_html(active().blocked)}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <input${attr("value", draft)} placeholder="Search or enter address" spellcheck="false" class="svelte-1ld6r3r"/></div> <button${attr_class("nav star svelte-1ld6r3r", void 0, { "filled": browser.isBookmarked() })}${attr("disabled", isStart(), true)} aria-label="Bookmark this page" title="Bookmark">★</button> <button class="nav svelte-1ld6r3r" aria-label="Command palette" title="Command palette (Ctrl+K)"><span class="mono kbd svelte-1ld6r3r">Ctrl K</span></button> <button class="nav svelte-1ld6r3r" aria-label="Toggle theme" title="Toggle light/dark">${escape_html(browser.session.theme === "dark" ? "&#x263C;" : "&#x263D;")}</button> <span class="gap svelte-1ld6r3r"></span> `);
    if (document?.documentElement?.dataset?.platform !== "macos") {
      $$renderer2.push(`<!--[0--><button class="nav svelte-1ld6r3r" aria-label="Minimize">─</button> <button class="nav svelte-1ld6r3r" aria-label="Maximize">□</button> <button class="nav close svelte-1ld6r3r" aria-label="Close">✕</button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let unsubs = [];
    function onKey(e) {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        invokeSafe("open_palette");
      } else if (mod && e.key.toLowerCase() === "t") {
        e.preventDefault();
        browser.openTab("vela://start");
      } else if (mod && e.key.toLowerCase() === "w") {
        e.preventDefault();
        const a = browser.active;
        if (a) browser.closeTab(a.id);
      } else if (mod && e.key.toLowerCase() === "l") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("vela:focus-omnibox"));
      } else if (e.altKey && e.key === "ArrowLeft") {
        const a = browser.active;
        if (a) browser.back(a.id);
      } else if (e.altKey && e.key === "ArrowRight") {
        const a = browser.active;
        if (a) browser.forward(a.id);
      }
    }
    onDestroy(() => {
      unsubs.forEach((u) => u());
      window.removeEventListener("keydown", onKey);
    });
    $$renderer2.push(`<div class="strip svelte-1uha8ag" data-tauri-drag-region="">`);
    TabRail($$renderer2);
    $$renderer2.push(`<!----> `);
    Toolbar($$renderer2);
    $$renderer2.push(`<!----></div>`);
  });
}
export {
  _page as default
};
