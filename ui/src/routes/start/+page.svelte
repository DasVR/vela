<script lang="ts">
  // The start page — rendered inside its own webview when a tab is a
  // "start" tab. Knows its own webview label so it can tell the Rust
  // core to navigate THIS tab.
  import { onMount } from 'svelte';
  import { tileFor, QUICK_LINKS, searchUrlFor, ENGINES, engineById } from '$lib/sites';
  import Icon from '$lib/components/Icon.svelte';

  let now = $state(new Date());
  let recents = $state<{ url: string; title: string }[]>([]);
  let bookmarks = $state<{ url: string; title: string }[]>([]);
  let theme = $state<'light' | 'dark'>('light');
  let engine = $state('duckduckgo');
  let query = $state('');
  let me: string | undefined;

  const hhmmss = $derived(
    [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((n) => String(n).padStart(2, '0'))
      .join(':')
  );
  const dateLine = $derived(
    now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
  );
  const greeting = $derived(
    now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'
  );
  const engineInfo = $derived(engineById(engine));

  async function go(raw: string) {
    const input = raw.trim();
    if (!input) return;
    const looksLikeUrl =
      /^https?:\/\//i.test(input) ||
      /^[\w-]+(\.[\w-]+)+(:\d+)?(\/.*)?$/.test(input);
    const url = looksLikeUrl
      ? input.replace(/^https?:\/\//i, '').startsWith('localhost')
        ? `http://${input}`
        : `https://${input.replace(/^https?:\/\//i, '')}`
      : searchUrlFor(input, engine);
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('load_in_tab', { id: me, url });
  }

  async function cycleEngine() {
    const ids = ENGINES.map((e) => e.id);
    const i = ids.indexOf(engine);
    engine = ids[(i + 1) % ids.length];
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('set_engine', { engine });
    } catch {
      /* plain browser dev */
    }
  }

  onMount(async () => {
    const tick = setInterval(() => (now = new Date()), 1000);
    try {
      const { getCurrentWebview } = await import('@tauri-apps/api/webview');
      me = getCurrentWebview().label;
      const { invoke } = await import('@tauri-apps/api/core');
      const s = await invoke<any>('start_state');
      theme = s.theme ?? 'light';
      engine = s.engine ?? 'duckduckgo';
      recents = s.recents ?? [];
      bookmarks = s.bookmarks ?? [];
    } catch {
      /* plain browser dev: show page anyway */
    }
    return () => clearInterval(tick);
  });

  $effect(() => {
    document.documentElement.dataset.theme = theme;
  });
</script>

<div class="page">
  <div class="greeting">{greeting}</div>
  <div class="clock mono" aria-hidden="true">{hhmmss}</div>
  <div class="date">{dateLine}</div>

  <form
    class="search"
    onsubmit={(e) => { e.preventDefault(); go(query); }}
  >
    <span class="search-icon"><Icon name="search" size={18} /></span>
    <input
      bind:value={query}
      placeholder="Search or enter address"
      spellcheck="false"
      aria-label="Search or enter address"
    />
    <button
      type="button"
      class="engine-chip mono"
      onclick={cycleEngine}
      title="Search engine: click to switch (currently {engineInfo.name})"
    >
      <span class="dot" style="background:{engineInfo.dot}"></span>
      {engineInfo.short}
    </button>
  </form>

  <nav class="tiles" aria-label="Quick links">
    {#each QUICK_LINKS as q}
      <button class="tile" onclick={() => go(q.url)} title={q.url}>
        <span class="tile-badge mono" style="background:{tileFor(q.url).bg};color:{tileFor(q.url).fg}">
          {tileFor(q.url).label}
        </span>
        <span class="tile-name">{q.name}</span>
      </button>
    {/each}
  </nav>

  {#if bookmarks.length}
    <section class="row">
      <h2>Bookmarks</h2>
      <div class="chips">
        {#each bookmarks.slice(0, 8) as b}
          <button class="chip" onclick={() => go(b.url)} title={b.url}>
            <span class="mono badge" style="background:{tileFor(b.url).bg};color:{tileFor(b.url).fg}">{tileFor(b.url).label}</span>
            <span class="name">{b.title || b.url}</span>
          </button>
        {/each}
      </div>
    </section>
  {/if}

  {#if recents.length}
    <section class="row">
      <h2>Recent</h2>
      <div class="chips">
        {#each recents as r}
          <button class="chip" onclick={() => go(r.url)} title={r.url}>
            <span class="mono badge" style="background:{tileFor(r.url).bg};color:{tileFor(r.url).fg}">{tileFor(r.url).label}</span>
            <span class="name">{r.title || r.url}</span>
          </button>
        {/each}
      </div>
    </section>
  {/if}
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 9vh 24px 48px;
    gap: 28px;
  }

  .greeting {
    font-size: 13px;
    font-weight: 300;
    color: var(--ink-soft);
    margin-bottom: -18px;
  }

  .clock {
    font-size: 88px;
    font-weight: 500;
    letter-spacing: 0.02em;
    line-height: 1;
    color: var(--ink);
    font-variant-numeric: tabular-nums;
  }

  .date {
    margin-top: -18px;
    font-size: 15px;
    font-weight: 300;
    color: var(--ink-soft);
  }

  .search {
    width: min(560px, 90vw);
    height: 46px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px 0 14px;
    border-radius: 23px;
    border: 1px solid var(--hairline);
    background: var(--raised);
    box-shadow: var(--shadow);
  }
  .search:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  .search-icon {
    flex: none;
    width: 18px;
    height: 18px;
    display: grid;
    place-items: center;
    color: var(--ink-soft);
  }
  .search input {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--ink);
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-size: 13.5px;
    outline: none;
  }

  .engine-chip {
    flex: none;
    height: 20px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 0 8px 0 6px;
    border: none;
    border-radius: 10px;
    background: color-mix(in srgb, var(--page) 50%, transparent);
    color: var(--ink-soft);
    font-size: 10px;
    cursor: default;
  }
  .engine-chip:hover { color: var(--ink); }
  .engine-chip .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex: none;
  }

  .tiles {
    display: grid;
    grid-template-columns: repeat(4, 104px);
    gap: 14px;
  }
  @media (max-width: 560px) {
    .tiles { grid-template-columns: repeat(2, 104px); }
  }

  .tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 64px;
    padding: 0;
    border: none;
    border-radius: 14px;
    background: transparent;
    cursor: default;
    transition: background 120ms ease, transform 120ms ease;
  }
  .tile:hover {
    background: var(--raised);
    transform: translateY(-2px);
  }

  .tile-badge {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    font-size: 13px;
    font-weight: 500;
  }

  .tile-name {
    font-size: 11.5px;
    color: var(--ink-soft);
  }

  .row {
    width: min(640px, 92vw);
  }
  .row h2 {
    font-size: 11px;
    font-weight: 400;
    color: var(--ink-soft);
    margin: 0 0 8px;
    border-bottom: 1px solid var(--hairline);
    padding-bottom: 6px;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .chip {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 28px;
    max-width: 240px;
    padding: 0 12px 0 6px;
    border: none;
    border-radius: 14px;
    background: var(--raised);
    cursor: default;
  }
  .chip:hover { box-shadow: inset 0 0 0 1px var(--accent); }

  .badge {
    width: 14px;
    height: 14px;
    border-radius: 4px;
    display: grid;
    place-items: center;
    font-size: 7px;
    flex: none;
  }

  .name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 12px;
    color: var(--ink);
  }
</style>
