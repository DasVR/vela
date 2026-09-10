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
  { id: "duckduckgo", name: "DuckDuckGo", pattern: "https://duckduckgo.com/?q=%s" },
  { id: "google", name: "Google", pattern: "https://www.google.com/search?q=%s" },
  { id: "bing", name: "Bing", pattern: "https://www.bing.com/search?q=%s" },
  { id: "brave", name: "Brave", pattern: "https://search.brave.com/search?q=%s" },
  { id: "startpage", name: "Startpage", pattern: "https://www.startpage.com/sp/search?query=%s" },
  { id: "ecosia", name: "Ecosia", pattern: "https://www.ecosia.org/search?q=%s" },
  { id: "mojeek", name: "Mojeek", pattern: "https://www.mojeek.com/search?q=%s" },
  { id: "searx", name: "SearX", pattern: "https://searx.be/search?q=%s" }
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
export {
  QUICK_LINKS as Q,
  engineById as e,
  searchUrlFor as s,
  tileFor as t
};
