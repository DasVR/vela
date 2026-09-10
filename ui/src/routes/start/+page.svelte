<script lang="ts">
  // The start page — rendered inside its own webview when a tab is a
  // "start" tab. Knows its own webview label so it can tell the Rust
  // core to navigate THIS tab.
  import { onMount } from 'svelte';
  import { tileFor, QUICK_LINKS } from '$lib/sites';

  let now = $state(new Date());
  let recents = $state<{ url: string; title: string }[]>([]);
  let bookmarks = $state<{ url: string; title: string }[]>([]);
  let theme = $state<'light' | 'dark'>('light');
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
      : `https://duckduckgo.com/?q=${encodeURIComponent(input)}`;
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('load_in_tab', { id: me, url });
  }

  onMount(async () => {
    const tick = setInterval(() => (now = new Date()), 1000);
    try {
      const { getCurrentWebview } = await import('@tauri-apps/api/webview');
      me = getCurrentWebview().label;
      const { invoke } = await import('@tauri-apps/api/core');
      const s = await invoke<any>('start_state');
      theme = s.theme ?? 'light';
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
  <div class="clock mono" aria-hidden="true">{hhmmss}</div>
  <div class="date">{dateLine}</div>

  <form
    class="search"
    onsubmit={(e) => { e.preventDefault(); go(query); }}
  >
    <input
      bind:value={query}
      placeholder="Search or enter address"
      spellcheck="false"
      aria-label="Search or enter address"
    />
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
      <div class="items">
        {#each bookmarks.slice(0, 8) as b}
          <button class="item" onclick={() => go(b.url)} title={b.url}>
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
      <div class="items">
        {#each recents as r}
          <button class="item" onclick={() => go(r.url)} title={r.url}>
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
  }
  .search input {
    width: 100%;
    height: 46px;
    padding: 0 20px;
    border-radius: 23px;
    border: 1px solid var(--hairline);
    background: var(--raised);
    color: var(--ink);
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-size: 13.5px;
    outline: none;
    box-shadow: var(--shadow);
  }
  .search input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .tiles {
    display: grid;
    grid-template-columns: repeat(4, 96px);
    gap: 14px;
  }
  @media (max-width: 560px) {
    .tiles { grid-template-columns: repeat(2, 96px); }
  }

  .tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 14px 0 10px;
    border: none;
    border-radius: 12px;
    background: transparent;
    cursor: default;
  }
  .tile:hover { background: var(--raised); }

  .tile-badge {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    font-size: 14px;
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

  .items {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 300px;
    padding: 6px 12px 6px 6px;
    border: none;
    border-radius: 9px;
    background: var(--raised);
    cursor: default;
  }
  .item:hover { box-shadow: inset 0 0 0 1px var(--accent); }

  .badge {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    display: grid;
    place-items: center;
    font-size: 9px;
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