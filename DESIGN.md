# Vela — design plan

A small, fast, personal browser. Vela is the constellation of the sail: the UI should feel
like a well-made instrument panel — calm, precise, quietly confident. Not a toy, not a
hacker terminal, not a SaaS dashboard.

## Audience / job
Built for one person first (the author), meant to be shown second (portfolio). Its job:
browse with calm authority — tabs, an omnibox, a shield against ads and trackers, and a
start page you actually want to land on.

## Palette
Light default (glacier over deep water), true dark mode. One accent, one semantic warn.

| token | light | dark | role |
|---|---|---|---|
| page | `#E9EEF2` | `#0B1218` | start/settings page background |
| strip | `#F8FAFC` | `#0E161D` | tab rail + toolbar |
| raised | `#FFFFFF` | `#16212B` | pills, tiles, palette |
| ink | `#14202B` | `#DFE9F0` | primary text |
| ink-soft | `#51606D` | `#8496A5` | secondary text |
| hairline | `#D8E0E7` | `#22303C` | borders |
| accent (teal) | `#0E8F8B` | `#2FC5BF` | focus ring, active tab underline |
| warn (coral) | `#E85D4A` | `#FF7A66` | shield/blocked counts only |

## Type
- **Sora** 200 / 400 / 600 — UI, tabs, the start-page clock. Geometric, slightly nautical.
- **IBM Plex Mono** 400 / 500 — the omnibox, URLs, counts, anything that is data.

## Layout
92px chrome strip, everything below is content webviews:

```
┌────────────────────────────────────────────────┐
│ ▣ gh · github · ✕   ⌂ ddg · duckduckgo · ✕  ➕ │  tab rail 40px
│ ◀  ▶  ⟳   ┌────────────────────────┐  ⛨2 ★ ⚙ │  toolbar 52px
│            │  url or search…         │          │  omnibox = the one bold element
└────────────────────────────────────────────────┘
```

Start page: huge light clock, quiet date, one search pill, eight monogram tiles,
one recents row. Centered, quiet, no gradients.

## Principles
- One bold move per screen (omnibox focus ring; start clock). Everything else quiet.
- Mono = data, Sora = words.
- Motion only answers a user action (focus ring, palette open). No entrance animations.
- No caps-lock eyebrows, no numbered markers, no arrow-decorated buttons.
- Errors name the fix ("Can't reach {host} — check the address or reload").