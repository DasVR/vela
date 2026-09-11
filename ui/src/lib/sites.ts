// URL → monogram tile + favicon helpers, the shield's cosmetic filter,
// and the search-engine registry.

export interface TileInfo {
  label: string;   // 1–2 letter monogram
  bg: string;      // tile background
  fg: string;      // monogram color
}

const TILES: Record<string, TileInfo> = {
  'github.com': { label: 'gh', bg: '#24292f', fg: '#ffffff' },
  'www.youtube.com': { label: 'yt', bg: '#ff0033', fg: '#ffffff' },
  'duckduckgo.com': { label: 'ddg', bg: '#de5833', fg: '#ffffff' },
  'www.google.com': { label: 'g', bg: '#ffffff', fg: '#14202b' },
  'www.bing.com': { label: 'b', bg: '#0f8f8f', fg: '#ffffff' },
  'search.brave.com': { label: 'br', bg: '#fb542b', fg: '#ffffff' },
  'news.ycombinator.com': { label: 'hn', bg: '#ff6600', fg: '#ffffff' },
  'reddit.com': { label: 'r', bg: '#ff4500', fg: '#ffffff' },
  'wikipedia.org': { label: 'w', bg: '#f8fafc', fg: '#14202b' },
  'figma.com': { label: 'fg', bg: '#0acf83', fg: '#0b1218' },
  'open.spotify.com': { label: 'sp', bg: '#1db954', fg: '#0b1218' },
  'chatgpt.com': { label: 'ai', bg: '#10a37f', fg: '#ffffff' },
  'claude.ai': { label: 'cl', bg: '#d97757', fg: '#ffffff' },
  'store.steampowered.com': { label: 'st', bg: '#171a21', fg: '#66c0f4' },
  'roblox.com': { label: 'rb', bg: '#e2231a', fg: '#ffffff' },
  'discord.com': { label: 'dc', bg: '#5865f2', fg: '#ffffff' },
  'twitch.tv': { label: 'tw', bg: '#9146ff', fg: '#ffffff' }
};

const MATCH_HOSTS = Object.keys(TILES).sort((a, b) => b.length - a.length);

export function tileFor(url: string): TileInfo {
  try {
    const host = new URL(url).hostname;
    const hit = MATCH_HOSTS.find((h) => host === h || host.endsWith('.' + h));
    if (hit) return TILES[hit];
    // derive a neutral monogram for unknown sites
    const parts = host.replace(/^www\./, '').split('.');
    const label = (parts[0] || '?').slice(0, 2).toLowerCase();
    return { label, bg: 'var(--raised)', fg: 'var(--ink)' };
  } catch {
    return { label: '?', bg: 'var(--raised)', fg: 'var(--ink)' };
  }
}

export function faviconFor(url: string): string | undefined {
  try {
    return `${new URL(url).origin}/favicon.ico`;
  } catch {
    return undefined;
  }
}

// ---- search engines ----------------------------------------------------------
// The engine is user-selectable and persisted (kv "engine") — networks that
// block one engine (schools commonly block DDG) get instant fallback.

export interface Engine {
  id: string;
  name: string;
  /** Short label for the omnibox / start-page engine chip */
  short: string;
  /** Brand color for the engine chip dot */
  dot: string;
  /** %s is replaced with the URL-encoded query */
  pattern: string;
}

export const ENGINES: Engine[] = [
  { id: 'duckduckgo', name: 'DuckDuckGo', short: 'DDG', dot: '#de5833', pattern: 'https://duckduckgo.com/?q=%s' },
  { id: 'google', name: 'Google', short: 'G', dot: '#4285f4', pattern: 'https://www.google.com/search?q=%s' },
  { id: 'bing', name: 'Bing', short: 'B', dot: '#0f8f8f', pattern: 'https://www.bing.com/search?q=%s' },
  { id: 'brave', name: 'Brave', short: 'BR', dot: '#fb542b', pattern: 'https://search.brave.com/search?q=%s' },
  { id: 'startpage', name: 'Startpage', short: 'SP', dot: '#627ee7', pattern: 'https://www.startpage.com/sp/search?query=%s' },
  { id: 'ecosia', name: 'Ecosia', short: 'EC', dot: '#59a86f', pattern: 'https://www.ecosia.org/search?q=%s' },
  { id: 'mojeek', name: 'Mojeek', short: 'MJ', dot: '#c63351', pattern: 'https://www.mojeek.com/search?q=%s' },
  { id: 'searx', name: 'SearX', short: 'SX', dot: '#2f8f6f', pattern: 'https://searx.be/search?q=%s' }
];

export const DEFAULT_ENGINE = 'duckduckgo';

export function engineById(id: string): Engine {
  return ENGINES.find((e) => e.id === id) ?? ENGINES[0];
}

export function searchUrlFor(query: string, engineId: string): string {
  return engineById(engineId).pattern.replace('%s', encodeURIComponent(query));
}

// ---- shield: cosmetic filter ------------------------------------------------

export const COSMETIC_CSS = `
a[href*="doubleclick.net"],
a[href*="googlesyndication"],
iframe[src*="doubleclick.net"],
iframe[src*="googlesyndication"],
iframe[src*="googletagmanager.com"],
iframe[src*="adservice.google"],
iframe[src*="adnxs"],
iframe[src*="taboola.com"],
iframe[src*="outbrain.com"],
div[id^="google_ads"],
div[id^="div-gpt-ad"],
div[id^="taboola-"],
div[class*="ad-slot"],
div[class*="ad_banner"],
div[class*="adsbygoogle"],
ins.adsbygoogle {
  display: none !important;
  height: 0 !important;
}
`;

export const QUICK_LINKS = [
  { url: 'https://github.com', name: 'GitHub' },
  { url: 'https://www.youtube.com', name: 'YouTube' },
  { url: 'https://news.ycombinator.com', name: 'Hacker News' },
  { url: 'https://www.wikipedia.org', name: 'Wikipedia' },
  { url: 'https://open.spotify.com', name: 'Spotify' },
  { url: 'https://chatgpt.com', name: 'ChatGPT' },
  { url: 'https://claude.ai', name: 'Claude' },
  { url: 'https://www.bing.com', name: 'Bing' }
];