# Vela

A small, fast, personal browser. Built with Tauri 2 (Rust core + real native
WebKitGTK webviews) and a Svelte 5 chrome UI.

**Free. No ads. No telemetry. No accounts.**

## Architecture

One OS window. The chrome (tab rail + toolbar) is a child webview pinned to
the top 92 logical pixels. Every tab is its own **real native webview**
stacked below — not an iframe, not a webview-per-window: true Chrome-style
multiwebview in Tauri 2 (requires the `unstable` feature).

```
┌────────────────────────────────────────────────┐
│ strip webview (92px): tabs · omnibox · shield  │
├────────────────────────────────────────────────┤
│ tab-1001 webview   (visible)                  │
│ tab-1002 webview   (hidden)                    │
│ …                                              │
└────────────────────────────────────────────────┘
```

- **Tabs** — `TabMgr` (Rust) owns webviews; the strip mirrors state over
  Tauri events (`tab://loaded`, …). A background poller watches each tab's
  URL and persists history/session to SQLite.
- **Shield** — cosmetic ad/tracker-slot hiding injected at document-start
  into every page (`src-tauri/src/shield.rs`).
- **Command palette** — Ctrl+K opens a borderless always-on-top window
  listing tabs, bookmarks, history, and commands.
- **Persistence** — SQLite at `~/.local/share/app.vela.browser/vela.db`
  (history, bookmarks, theme, open-tab session restore).
- **Security** — IPC commands are gated: external websites loaded in tabs
  cannot invoke browser commands or read your data (origin + label checks
  in every command).

## Build

Prereqs (Ubuntu/Debian): `libwebkit2gtk-4.1-dev libgtk-3-dev build-essential
curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev
librsvg2-dev`

```bash
cd ui && npm install && npm run build      # build the frontend
cd ../src-tauri
cargo build --release --features production   # dev server build: omit the feature
# or bundle installers:
cargo tauri build
```

Binary: `src-tauri/target/release/vela` (~6.6 MB).

## Dev mode

```bash
cd ui && npm run dev        # vite on :1420
cd ../src-tauri && cargo run
```

## Shortcuts

| Keys | Action |
|---|---|
| Ctrl+K | command palette |
| Ctrl+T | new tab |
| Ctrl+W | close tab |
| Ctrl+L | focus omnibox |
| Alt+← / → | back / forward |

## Status

v0.1.0 — core browsing loop verified end-to-end (tabs, navigation,
history, session restore, palette). Known gaps: network-level adblock
(needs a filtering proxy or WebKitGTK extension API), favicons are
monogram tiles, no download manager yet.