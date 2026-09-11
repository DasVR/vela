import { a9 as attr } from "./index.js";
const TILES = {
  "github.com": { label: "gh", bg: "#24292f", fg: "#ffffff" },
  "www.youtube.com": { label: "yt", bg: "#ff0033", fg: "#ffffff" },
  "duckduckgo.com": { label: "ddg", bg: "#de5833", fg: "#ffffff" },
  "www.google.com": { label: "g", bg: "#ffffff", fg: "#14202b" },
  "www.bing.com": { label: "b", bg: "#0f8f8f", fg: "#ffffff" },
  "search.brave.com": { label: "br", bg: "#fb542b", fg: "#ffffff" },
  "news.ycombinator.com": { label: "hn", bg: "#ff6600", fg: "#ffffff" },
  "reddit.com": { label: "r", bg: "#ff4500", fg: "#ffffff" },
  "wikipedia.org": { label: "w", bg: "#f8fafc", fg: "#14202b" },
  "figma.com": { label: "fg", bg: "#0acf83", fg: "#0b1218" },
  "open.spotify.com": { label: "sp", bg: "#1db954", fg: "#0b1218" },
  "chatgpt.com": { label: "ai", bg: "#10a37f", fg: "#ffffff" },
  "claude.ai": { label: "cl", bg: "#d97757", fg: "#ffffff" },
  "store.steampowered.com": { label: "st", bg: "#171a21", fg: "#66c0f4" },
  "roblox.com": { label: "rb", bg: "#e2231a", fg: "#ffffff" },
  "discord.com": { label: "dc", bg: "#5865f2", fg: "#ffffff" },
  "twitch.tv": { label: "tw", bg: "#9146ff", fg: "#ffffff" }
};
const MATCH_HOSTS = Object.keys(TILES).sort((a, b) => b.length - a.length);
function tileFor(url) {
  try {
    const host = new URL(url).hostname;
    const hit = MATCH_HOSTS.find((h) => host === h || host.endsWith("." + h));
    if (hit) return TILES[hit];
    const parts = host.replace(/^www\./, "").split(".");
    const label = (parts[0] || "?").slice(0, 2).toLowerCase();
    return { label, bg: "var(--raised)", fg: "var(--ink)" };
  } catch {
    return { label: "?", bg: "var(--raised)", fg: "var(--ink)" };
  }
}
const ENGINES = [
  { id: "duckduckgo", name: "DuckDuckGo", short: "DDG", dot: "#de5833", pattern: "https://duckduckgo.com/?q=%s" },
  { id: "google", name: "Google", short: "G", dot: "#4285f4", pattern: "https://www.google.com/search?q=%s" },
  { id: "bing", name: "Bing", short: "B", dot: "#0f8f8f", pattern: "https://www.bing.com/search?q=%s" },
  { id: "brave", name: "Brave", short: "BR", dot: "#fb542b", pattern: "https://search.brave.com/search?q=%s" },
  { id: "startpage", name: "Startpage", short: "SP", dot: "#627ee7", pattern: "https://www.startpage.com/sp/search?query=%s" },
  { id: "ecosia", name: "Ecosia", short: "EC", dot: "#59a86f", pattern: "https://www.ecosia.org/search?q=%s" },
  { id: "mojeek", name: "Mojeek", short: "MJ", dot: "#c63351", pattern: "https://www.mojeek.com/search?q=%s" },
  { id: "searx", name: "SearX", short: "SX", dot: "#2f8f6f", pattern: "https://searx.be/search?q=%s" }
];
function engineById(id) {
  return ENGINES.find((e) => e.id === id) ?? ENGINES[0];
}
function searchUrlFor(query, engineId) {
  return engineById(engineId).pattern.replace("%s", encodeURIComponent(query));
}
const QUICK_LINKS = [
  { url: "https://github.com", name: "GitHub" },
  { url: "https://www.youtube.com", name: "YouTube" },
  { url: "https://news.ycombinator.com", name: "Hacker News" },
  { url: "https://www.wikipedia.org", name: "Wikipedia" },
  { url: "https://open.spotify.com", name: "Spotify" },
  { url: "https://chatgpt.com", name: "ChatGPT" },
  { url: "https://claude.ai", name: "Claude" },
  { url: "https://www.bing.com", name: "Bing" }
];
function Icon($$renderer, $$props) {
  let { name, size = 15 } = $$props;
  const P = {
    // chevron-based arrows: crisp at 1.5 stroke
    back: "M9.5 3.5 5 8l4.5 4.5",
    forward: "M6.5 3.5 11 8l-4.5 4.5",
    // circular arrow, open at top-right
    reload: "M13 8a5 5 0 1 1-1.7-3.8M13 2.8v2.4h-2.4",
    // five-point star, outline
    star: "M8 2.6l1.5 3 3.3.5-2.4 2.3.6 3.3L8 10.1l-3 1.6.6-3.3L3.2 6.1l3.3-.5z",
    // same star, filled
    starFill: "M8 2.6l1.5 3 3.3.5-2.4 2.3.6 3.3L8 10.1l-3 1.6.6-3.3L3.2 6.1l3.3-.5z",
    // shield: rounded kite
    shield: "M8 2.2l4.4 1.6v3.4c0 2.8-1.8 4.9-4.4 6.6-2.6-1.7-4.4-3.8-4.4-6.6V3.8z",
    plus: "M8 4v8M4 8h8",
    close: "M4.5 4.5l7 7M11.5 4.5l-7 7",
    // crescents
    moon: "M12.5 9.8A5.2 5.2 0 0 1 6.2 3.5a5.4 5.4 0 1 0 6.3 6.3z",
    sun: "M8 5.2A2.8 2.8 0 1 0 8 10.8 2.8 2.8 0 0 0 8 5.2zM8 2v1.4M8 12.6V14M2 8h1.4M12.6 8H14M3.8 3.8l1 1M11.2 11.2l1 1M12.2 3.8l-1 1M4.8 11.2l-1 1",
    chevDown: "M4.5 6.5 8 10l3.5-3.5",
    // magnifier
    search: "M7 2.8a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4zM10.2 10.2 13.5 13.5",
    // closed padlock
    lock: "M4.5 7.5h7v6h-7zM6 7.5V5.6a2 2 0 0 1 4 0V7.5M8 10.4v1.4"
  };
  $$renderer.push(`<svg${attr("width", size)}${attr("height", size)} viewBox="0 0 16 16"${attr("fill", name === "starFill" ? "currentColor" : "none")} stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path${attr("d", P[name] ?? "")}></path></svg>`);
}
export {
  Icon as I,
  QUICK_LINKS as Q,
  engineById as e,
  searchUrlFor as s,
  tileFor as t
};
