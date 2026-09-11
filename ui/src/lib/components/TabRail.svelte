<script lang="ts">
  import { browser } from '$lib/browser.svelte';
  import { tileFor } from '$lib/sites';
  import Icon from '$lib/components/Icon.svelte';

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
      <span class="t" class:loading={tab.loading}>{tab.title || '…'}</span>
      {#if tab.blocked > 0}
        <span class="shield mono" title="{tab.blocked} blocked on this tab">
          <Icon name="shield" size={12} />{tab.blocked}
        </span>
      {/if}
      <span
        class="x"
        role="button"
        tabindex="-1"
        aria-label="Close tab"
        onclick={(e) => close(e, tab.id)}
      ><Icon name="close" size={12} /></span>
    </button>
  {/each}
  <button class="new" onclick={() => browser.openTab('vela://start')} aria-label="New tab">
    <Icon name="plus" />
  </button>
</div>

<style>
  .rail {
    height: 40px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 8px;
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
    height: 30px;
    padding: 0 8px 0 6px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--ink-soft);
    cursor: default;
    font-size: 12px;
  }
  .tab:hover:not(.active) {
    background: color-mix(in srgb, var(--page) 60%, transparent);
  }
  .tab.active {
    background: var(--page);
    color: var(--ink);
    box-shadow: inset 0 1.5px 0 var(--accent);
  }
  /* macOS: active tab = glass capsule with specular edge */
  :global(html[data-platform='macos']) .tab.active {
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(26px) saturate(1.7);
    -webkit-backdrop-filter: blur(26px) saturate(1.7);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.65),
      inset 0 1.5px 0 var(--accent),
      0 2px 12px rgba(20, 32, 43, 0.06);
  }
  :global(html[data-theme='dark'][data-platform='macos']) .tab.active {
    background: rgba(22, 33, 43, 0.48);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.22),
      inset 0 1.5px 0 var(--accent),
      0 2px 12px rgba(0, 0, 0, 0.35);
  }
  .tab.crashed .t { color: var(--warn); }

  .tile {
    flex: none;
    width: 16px;
    height: 16px;
    border-radius: 5px;
    display: grid;
    place-items: center;
    font-size: 8px;
    font-weight: 500;
  }

  .t {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: left;
  }
  .t.loading {
    animation: vela-shimmer 1.2s ease-in-out infinite;
  }

  .shield {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 2px;
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
    color: var(--ink-soft);
    opacity: 0;
    transition: opacity 100ms ease;
  }
  .tab:hover .x,
  .tab.active .x { opacity: 1; }
  .x:hover { background: var(--hairline); color: var(--ink); }

  .new {
    flex: none;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 7px;
    background: transparent;
    color: var(--ink-soft);
    display: grid;
    place-items: center;
    cursor: default;
  }
  .new:hover { background: var(--page); color: var(--ink); }
</style>
