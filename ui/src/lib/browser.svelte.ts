// Tab model shared by all UI components.
// The Rust side owns the real webviews; this mirrors their state and
// sends commands back over Tauri IPC.

import { searchUrlFor } from '$lib/sites';

export type TabKind = 'start' | 'page';

export interface Tab {
  id: string;          // webview label on the Rust side, e.g. "tab-3"
  kind: TabKind;
  title: string;
  url: string;         // canonical, or 'vela://start' for the start page
  loading: boolean;
  blocked: number;     // requests blocked by the shield on this tab
  crashed: boolean;
  error?: string;
}

export interface HistoryEntry {
  url: string;
  title: string;
  at: number;          // epoch ms
}

export interface Bookmark {
  url: string;
  title: string;
  at: number;
}

export interface SessionState {
  history: HistoryEntry[];
  bookmarks: Bookmark[];
  tabs: { id: string; url: string; title: string }[];
  activeId?: string;
  theme: 'light' | 'dark';
}

let nextId = 1;
const newTabId = () => `tab-${nextId++}`;

const tabs = $state<Tab[]>([]);
let activeId = $state<string>('');
let history = $state<HistoryEntry[]>([]);
let bookmarks = $state<Bookmark[]>([]);
const session = $state<{ theme: 'light' | 'dark'; engine: string }>({ theme: 'light', engine: 'duckduckgo' });

export const browser = {
  get tabs() { return tabs; },
  get activeId() { return activeId; },
  get active() { return tabs.find((t) => t.id === activeId); },
  get history() { return history; },
  get bookmarks() { return bookmarks; },
  get session() { return session; },

  async init() {
    try {
      const s = await invoke<SessionState>('restore_session');
      history = s.history ?? [];
      bookmarks = s.bookmarks ?? [];
      session.theme = s.theme ?? 'light';
      session.engine = s.engine ?? 'duckduckgo';
      const tabsIn = s.tabs ?? [];
      if (tabsIn.length) {
        for (const t of tabsIn) this.openTab(t.url || 'vela://start', t.id, { title: t.title, activate: t.id === s.activeId });
        if (!tabs.some((t) => t.id === activeId) && tabs.length) this.activate(tabs[0].id);
      } else {
        this.openTab('vela://start', undefined, { activate: true });
      }
    } catch {
      this.openTab('vela://start', undefined, { activate: true });
    }
  },

  // --- tabs -------------------------------------------------------------
  openTab(url: string, id?: string, opts: { title?: string; activate?: boolean } = {}) {
    const tab: Tab = {
      id: id || newTabId(),
      kind: url.startsWith('vela://') ? 'start' : 'page',
      title: opts.title || (url.startsWith('vela://') ? 'New tab' : url),
      url,
      loading: url.startsWith('vela://') ? false : true,
      blocked: 0,
      crashed: false
    };
    tabs.push(tab);
    invokeSafe('create_webview_tab', { id: tab.id, url, activate: opts.activate !== false });
    if (opts.activate !== false) this.activate(tab.id);
    return tab;
  },

  activate(id: string) {
    activeId = id;
    invokeSafe('activate_tab', { id });
  },

  closeTab(id: string) {
    const i = tabs.findIndex((t) => t.id === id);
    if (i === -1) return;
    tabs.splice(i, 1);
    invokeSafe('close_tab', { id });
    if (activeId === id) {
      const next = tabs[Math.min(i, tabs.length - 1)];
      if (next) this.activate(next.id);
      else setTimeout(() => this.openTab('vela://start', undefined, { activate: true }), 0);
    }
  },

  // --- navigation -------------------------------------------------------
  navigate(id: string, raw: string) {
    const tab = tabs.find((t) => t.id === id);
    if (!tab) return;
    const url = normalizeUrl(raw, session.engine);
    tab.url = url;
    tab.kind = url.startsWith('vela://') ? 'start' : 'page';
    tab.loading = tab.kind === 'page';
    tab.crashed = false;
    tab.error = undefined;
    invokeSafe('load_in_tab', { id, url });
  },

  back(id: string) { invokeSafe('go_back', { id }); },
  forward(id: string) { invokeSafe('go_forward', { id }); },
  reload(id: string) { invokeSafe('reload_tab', { id }); },

  // --- state updates from Rust ------------------------------------------
  onLoading(id: string, loading: boolean) {
    const tab = tabs.find((t) => t.id === id);
    if (tab) tab.loading = loading;
  },

  onLoaded(id: string, url: string, title: string) {
    const tab = tabs.find((t) => t.id === id);
    if (!tab) return;
    tab.url = url;
    if (url.startsWith('vela://')) {
      tab.kind = 'start';
      tab.title = 'New tab';
    } else {
      tab.kind = 'page';
      if (title) tab.title = title;
      const entry: HistoryEntry = { url, title: title || url, at: Date.now() };
      history = [entry, ...history].slice(0, 500);
      invokeSafe('add_history', { entry });
    }
    tab.loading = false;
    tab.crashed = false;
    tab.error = undefined;
  },

  onTitle(id: string, title: string) {
    const tab = tabs.find((t) => t.id === id);
    if (tab && title) tab.title = title;
  },

  onUrl(id: string, url: string) {
    const tab = tabs.find((t) => t.id === id);
    if (tab) tab.url = url;
  },

  onBlocked(id: string, delta: number) {
    const tab = tabs.find((t) => t.id === id);
    if (tab) tab.blocked += delta;
  },

  onCrashed(id: string, msg: string) {
    const tab = tabs.find((t) => t.id === id);
    if (tab) {
      tab.crashed = true;
      tab.loading = false;
      tab.error = msg;
    }
  },

  // --- bookmarks / settings ----------------------------------------------
  isBookmarked(): boolean {
    const tab = this.active;
    return !!tab && tab.kind === 'page' && bookmarks.some((b) => b.url === tab.url);
  },

  toggleBookmark(): boolean {
    const tab = this.active;
    if (!tab || tab.kind !== 'page') return false;
    const i = bookmarks.findIndex((b) => b.url === tab.url);
    if (i >= 0) {
      bookmarks.splice(i, 1);
      invokeSafe('remove_bookmark', { url: tab.url });
      return false;
    }
    const b: Bookmark = { url: tab.url, title: tab.title, at: Date.now() };
    bookmarks.push(b);
    invokeSafe('add_bookmark', { bookmark: b });
    return true;
  },

  setTheme(theme: 'light' | 'dark') {
    session.theme = theme;
    invokeSafe('set_theme', { theme });
  },

  setEngine(engine: string) {
    session.engine = engine;
    invokeSafe('set_engine', { engine });
  },

  clearHistory() {
    history = [];
    invokeSafe('clear_history', {});
  }
};

export function normalizeUrl(raw: string, engine = 'duckduckgo'): string {
  const input = raw.trim();
  if (!input) return 'vela://start';
  if (input.startsWith('vela://')) return input;
  const hasPort = /^[\w.-]+:\d+/.test(input);
  const looksLikeUrl =
    /^https?:\/\//i.test(input) ||
    /^[\w-]+(\.[\w-]+)+(:\d+)?(\/.*)?$/.test(input) ||
    input.startsWith('localhost');
  if (looksLikeUrl && !input.includes(' ')) {
    if (/^https?:\/\//i.test(input)) return input;
    // local addresses with ports: keep plain http (local servers are rarely https)
    if (hasPort || input.startsWith('localhost')) return `http://${input}`;
    return `https://${input}`;
  }
  return searchUrlFor(input, engine);
}

// invoke that tolerates running in a plain browser (vite dev / preview)
let tauriInvoke: ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>) | null | undefined;
async function resolveInvoke() {
  if (tauriInvoke !== undefined) return tauriInvoke;
  try {
    const core = await import('@tauri-apps/api/core');
    // probing with a harmless call: throws when not under Tauri
    tauriInvoke = core.invoke;
  } catch {
    tauriInvoke = null;
  }
  return tauriInvoke;
}

export async function invoke<T = unknown>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const fn = await resolveInvoke();
  if (!fn) throw new Error('not running under Tauri');
  return fn(cmd, args) as Promise<T>;
}

async function invokeSafe(cmd: string, args?: Record<string, unknown>) {
  try {
    await invoke(cmd, args);
  } catch {
    /* dev-in-browser: commands are no-ops without the Rust core */
  }
}
export { invokeSafe };