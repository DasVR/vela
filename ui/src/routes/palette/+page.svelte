<script lang="ts">
  // Command palette — its own small borderless window above the main one.
  import { onMount } from 'svelte';

  type Row =
    | { kind: 'tab'; id: string; label: string; hint: string }
    | { kind: 'url'; url: string; label: string; hint: string; source: 'bookmark' | 'history' }
    | { kind: 'cmd'; value: string; label: string; hint: string };

  let rows = $state<Row[]>([]);
  let filtered = $state<Row[]>([]);
  let q = $state('');
  let sel = $state(0);
  let input: HTMLInputElement | undefined = $state();

  function filter() {
    const needle = q.trim().toLowerCase();
    if (!needle) {
      filtered = rows.slice(0, 12);
      sel = 0;
      return;
    }
    filtered = rows
      .filter(
        (r) =>
          r.label.toLowerCase().includes(needle) ||
          (r as any).hint?.toLowerCase?.().includes(needle)
      )
      .slice(0, 12);
    sel = 0;
  }

  function pick(r: Row) {
    import('@tauri-apps/api/core').then(async (core) => {
      const { emit } = await import('@tauri-apps/api/event');
      if (r.kind === 'tab') await emit('palette://go', { kind: 'tab', value: r.id });
      else if (r.kind === 'url') await emit('palette://go', { kind: 'url', value: r.url });
      else await emit('palette://go', { kind: 'cmd', value: r.value });
      await core.invoke('close_palette');
    });
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, filtered.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); }
    else if (e.key === 'Enter' && filtered[sel]) pick(filtered[sel]);
    else if (e.key === 'Escape') import('@tauri-apps/api/core').then(({ invoke }) => invoke('close_palette'));
  }

  onMount(async () => {
    window.addEventListener('keydown', onKey);
    input?.focus();
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const [tabs, s] = await Promise.all([
        invoke<any[]>('list_tabs'),
        invoke<any>('restore_session')
      ]);
      const out: Row[] = [];
      for (const t of tabs) out.push({ kind: 'tab', id: t.id, label: t.title || t.url, hint: t.url });
      for (const b of s.bookmarks ?? []) out.push({ kind: 'url', url: b.url, label: b.title || b.url, hint: 'bookmark', source: 'bookmark' });
      const seen = new Set<string>();
      for (const h of (s.history ?? []).slice(0, 40)) {
        if (seen.has(h.url)) continue;
        seen.add(h.url);
        out.push({ kind: 'url', url: h.url, label: h.title || h.url, hint: 'history', source: 'history' });
      }
      out.push({ kind: 'cmd', value: 'new-tab', label: 'New tab', hint: 'Ctrl T' });
      out.push({ kind: 'cmd', value: 'theme', label: 'Toggle light / dark theme', hint: '' });
      out.push({ kind: 'cmd', value: 'clear-history', label: 'Clear browsing history', hint: '' });
      rows = out;
    } catch {
      rows = [{ kind: 'cmd', value: 'new-tab', label: 'New tab', hint: '' }];
    }
    filter();
    return () => window.removeEventListener('keydown', onKey);
  });
</script>

<svelte:window onkeydown={undefined} />

<div class="pal">
  <input
    bind:this={input}
    bind:value={q}
    oninput={() => filter()}
    placeholder="Type to search tabs, bookmarks, history, commands"
    spellcheck="false"
    aria-label="Command palette"
  />
  <ul role="listbox">
    {#each filtered as r, i}
      <li
        class:sel={i === sel}
        role="option"
        aria-selected={i === sel}
        onmouseenter={() => (sel = i)}
        onclick={() => pick(r)}
      >
        <span class="kind mono">
          {r.kind === 'tab' ? 'tab' : r.kind === 'cmd' ? 'cmd' : (r as any).source}
        </span>
        <span class="label">{r.label}</span>
        <span class="hint mono">{r.hint}</span>
      </li>
    {/each}
  </ul>
</div>

<style>
  :global(html, body) { background: transparent; }

  .pal {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--raised);
    border: 1px solid var(--hairline);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: var(--shadow);
  }

  input {
    height: 46px;
    padding: 0 16px;
    border: none;
    border-bottom: 1px solid var(--hairline);
    background: transparent;
    color: var(--ink);
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-size: 13px;
    outline: none;
  }
  input:focus { box-shadow: inset 0 2px 0 var(--accent); }

  ul {
    list-style: none;
    margin: 0;
    padding: 6px;
    overflow-y: auto;
    flex: 1;
  }
  li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: default;
  }
  li.sel { background: var(--accent-soft); box-shadow: inset 0 0 0 1px var(--accent); }

  .kind {
    flex: none;
    width: 52px;
    font-size: 9.5px;
    color: var(--ink-soft);
  }
  .label {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 12.5px;
    color: var(--ink);
  }
  .hint {
    flex: none;
    font-size: 9.5px;
    color: var(--ink-soft);
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>