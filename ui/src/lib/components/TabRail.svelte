<script lang="ts">
  import { browser } from '$lib/browser.svelte';
  import { tileFor } from '$lib/sites';

  function close(e: MouseEvent, id: string) {
    e.stopPropagation();
    browser.closeTab(id);
  }
</script>

<div class="rail" data-tauri-drag-region>
  {#each browser.tabs as tab (tab.id)}
    <button
      class="tab"
      class:active={tab.id === browser.activeId}
      class:crashed={tab.crashed}
      onclick={() => browser.activate(tab.id)}
      title={tab.url}
    >
      <span
        class="tile mono"
        style="background:{tileFor(tab.url).bg};color:{tileFor(tab.url).fg}"
      >{tileFor(tab.url).label}</span>
      <span class="t">{tab.loading ? 'Loading…' : tab.title}</span>
      {#if tab.blocked > 0}<span class="shield mono" title="{tab.blocked} blocked on this tab">⛨{tab.blocked}</span>{/if}
      <span
        class="x"
        role="button"
        tabindex="-1"
        aria-label="Close tab"
        onclick={(e) => close(e, tab.id)}
      >✕</span>
    </button>
  {/each}
  <button class="new" onclick={() => browser.openTab('vela://start')} aria-label="New tab">+</button>
</div>

<style>
  .rail {
    height: 40px;
    display: flex;
    align-items: flex-end;
    gap: 4px;
    padding: 6px 8px 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .rail::-webkit-scrollbar { display: none; }

  .tab {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 0 1 220px;
    min-width: 120px;
    height: 34px;
    padding: 0 8px 0 6px;
    border: none;
    border-radius: 8px 8px 0 0;
    background: transparent;
    color: var(--ink-soft);
    cursor: default;
    font-size: 12px;
  }
  .tab:hover { background: var(--page); color: var(--ink); }
  .tab.active {
    background: var(--page);
    color: var(--ink);
    box-shadow: inset 0 2px 0 var(--accent);
  }
  .tab.crashed .t { color: var(--warn); }

  .tile {
    flex: none;
    width: 18px;
    height: 18px;
    border-radius: 5px;
    display: grid;
    place-items: center;
    font-size: 9px;
    font-weight: 500;
  }

  .t {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: left;
  }

  .shield {
    flex: none;
    font-size: 9px;
    color: var(--warn);
  }

  .x {
    flex: none;
    width: 16px;
    height: 16px;
    border-radius: 4px;
    display: grid;
    place-items: center;
    font-size: 10px;
    color: var(--ink-soft);
  }
  .x:hover { background: var(--hairline); color: var(--ink); }

  .new {
    flex: none;
    width: 28px;
    height: 28px;
    margin-bottom: 3px;
    border: none;
    border-radius: 7px;
    background: transparent;
    color: var(--ink-soft);
    font-size: 16px;
    cursor: default;
  }
  .new:hover { background: var(--page); color: var(--ink); }
</style>