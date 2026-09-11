# Vela UI v2 — design spec

Same glacier identity, executed properly. What changes: real icon system,
tabs that read as tabs, an omnibox that communicates state, a start page
with hierarchy, and motion that answers actions.

Unchanged: palette, Sora + IBM Plex Mono, 92px strip, glass capsules on
macOS (see liquid-glass-web rules), palette window, keyboard shortcuts.

## 1. Icon system (Icons.svelte — already created, use it)

All icons: 16×16 viewBox, stroke 1.5, round caps + joins, `currentColor`,
`fill="none"`. Optical size 15px in chrome.

Import: `import Icon from '$lib/components/Icon.svelte'`, use
`<Icon name="back" />`. Names: back, forward, reload, star, starFill,
shield, plus, close, moon, sun, chevDown, search, lock.

Unicode glyphs in chrome are BANNED after this pass.

## 2. Tab rail

- Height stays 40px. Tabs 30px tall, radius 8px all corners (no more
  "bottom-flat tab button" look — these are cards now).
- Active tab: `background: var(--page)` + `box-shadow: inset 0 1.5px 0 var(--accent)`
  (thinner accent underline), full ink. macOS: glass capsule variant
  (existing `html[data-platform='macos']` pattern).
- Inactive tabs: fully transparent at rest, hover `background: var(--page)`
  at 60% (`color-mix(in srgb, var(--page) 60%, transparent)`), ink-soft.
- Close button: **visible only on tab hover/active** (opacity 0 → 1, 100ms).
  16×16, radius 4, hover bg hairline. Keyboard: keep ✕ text but use Icon.
- Site tile (monogram): 16×16, radius 5, stays.
- Loading state: title text gets `animation: vela-shimmer` — a 1.2s
  opacity pulse 1 → 0.55 → 1 while `tab.loading`. Replace "Loading…" text
  with the real title + shimmer (or "…" if no title yet).
- New tab button: 28×28, Icon `plus`, hover raised bg.

## 3. Toolbar

- Buttons: 30×30, radius 8, Icon 15px, ink-soft → ink + raised bg on hover,
  120ms. Disabled: opacity .35 (unchanged).
- Back/forward/reload: Icon back/forward/reload.
- Star: Icon star (outline) / starFill (bookmarked, accent color).
- Theme: Icon moon (in light mode, means "switch to dark") / sun (in dark).
- Omnibox — the hero, now with three zones:
  - LEFT: 18px status glyph. Start tab → Icon search ink-soft. https page →
    Icon lock, ink-soft. http page → Icon lock + `color: var(--warn)` +
    title "Not secure". (plain text/title only, no glyph swap needed beyond
    these three cases)
  - CENTER: input, unchanged (Plex Mono 12.5px).
  - RIGHT: engine chip — small pill inside the omnibox, 20px tall: a 7px
    dot in the engine's brand color + engine short name in 10px Plex Mono,
    ink-soft. Chip bg `var(--page)` at 50% (or transparent on glass). Click
    = existing engine-cycle behavior (moves here from the old toolbar
    button — delete that button).
- Progress bar: 2px, accent color, along the BOTTOM edge of the toolbar
  (bottom of the 92px strip), width animates 8% → 70% over 1.2s while any
  tab is loading, snaps to 100% then fades 200ms on load end. Implement
  pure-CSS width transitions driven by a `.loading` class on `.strip`.
- macOS glass: omnibox keeps its glass capsule. Progress bar color:
  accent, 90% opacity.

## 4. Start page

- Clock hero stays: 88px Plex Mono 500, tabular-nums. ADD greeting line
  above the clock, 13px Sora 300 ink-soft: "Good morning/afternoon/evening"
  by local hour (<12, <18, else evening).
- Search pill: 560px, 46px, radius 23 — gains the same left search Icon
  (18px, ink-soft) and right engine chip as the omnibox (visual echo of
  the chrome; chip click cycles engine + updates instantly on both).
- Tiles: 8 quick links, grid `repeat(4, 104px)`, tile 64px tall, radius 14.
  Hover: bg raised + translateY(-2px) 120ms. Tile = 40px monogram badge +
  11.5px name. Keep existing monograms.
- Recent + Bookmarks: horizontal chip rows (not stacked cards). Chip: 28px
  tall, radius 14, bg raised, 14px monogram + 12px name, max-width 240px,
  ellipsis. Section label 11px ink-soft, bottom hairline, as now.
- Empty states (no recents/bookmarks): show NOTHING (no empty section) —
  the page stays clean on first run. Only render sections with content.

## 5. Motion rules

- 120ms ease for hover/focus transitions (existing).
- Shimmer: 1.2s infinite while loading.
- Tile hover lift: 120ms, 2px.
- NO entrance animations, no fades on load (unchanged).
- All `prefers-reduced-motion` rules in app.css still apply.

## 6. Out of scope (do NOT touch)

- Rust core, tauri commands, browser.svelte.ts logic (class bindings OK)
- Palette window design
- palette/start route structure
- sites.ts ENGINES/TILES data (add `short` + `dot` fields ONLY — see below)

## 7. Engine chip data

Add to each engine in sites.ts:
- `short`: 'DDG','G','B','BR','SP','EC','MJ','SX'
- `dot`: brand color — DDG #de5833, G #4285f4, B #0f8f8f, BR #fb542b,
  SP #627ee7, EC #59a86f, MJ #c63351, SX #2f8f6f

## Files

- NEW `ui/src/lib/components/Icon.svelte` (created — do not redesign)
- `ui/src/lib/components/TabRail.svelte`
- `ui/src/lib/components/Toolbar.svelte`
- `ui/src/routes/start/+page.svelte`
- `ui/src/lib/sites.ts` (engine fields only)
- `ui/src/app.css` (shimmer keyframes + any shared tokens)

Acceptance: `npm run build` passes; strip shows icons not glyphs; tab
close on hover; omnibox has lock/search + engine chip; start page has
greeting + engine-chipped pill + chip rows; no empty sections on fresh db.