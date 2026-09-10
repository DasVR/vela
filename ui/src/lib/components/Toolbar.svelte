<script lang="ts">
  import { browser, invokeSafe } from '$lib/browser.svelte';
  import { ENGINES, engineById } from '$lib/sites';

  let draft = $state('');
  let focused = $state(false);
  let omnibox: HTMLInputElement | undefined = $state();

  // mirror the active tab's url into the omnibox when not editing
  $effect(() => {
    if (focused) return;
    const a = browser.active;
    draft = a && a.kind === 'page' ? a.url : '';
  });

  window.addEventListener('vela:focus-omnibox', () => {
    omnibox?.focus();
    omnibox?.select();
  });

  function submit() {
    const a = browser.active;
    if (!a || !draft.trim()) return;
    browser.navigate(a.id, draft);
    omnibox?.blur();
  }

  function escape() {
    const a = browser.active;
    draft = a && a.kind === 'page' ? a.url : '';
    omnibox?.blur();
  }

  async function winCtl(fn: 'minimize' | 'toggleMaximize' | 'close') {
    if (document.documentElement.dataset.platform === 'macos') return;
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const w = getCurrentWindow();
    if (fn === 'minimize') w.minimize();
    else if (fn === 'toggleMaximize') w.toggleMaximize();
    else w.close();
  }


  const active = $derived(browser.active);
  const isStart = $derived(!active || active.kind === 'start');
  const engineName = $derived(engineById(browser.session.engine).name);
</script>

<div class="bar">
  <button
    class="nav"
    disabled={isStart}
    onclick={() => active && browser.back(active.id)}
    aria-label="Back"
    title="Back (Alt+←)"
  >&#x25C0;</button>
  <button
    class="nav"
    disabled={isStart}
    onclick={() => active && browser.forward(active.id)}
    aria-label="Forward"
    title="Forward (Alt+→)"
  >&#x25B6;</button>
  <button
    class="nav"
    disabled={isStart}
    onclick={() => active && browser.reload(active.id)}
    aria-label="Reload"
    title="Reload"
  >&#x27F3;</button>

  <div class="omni" class:editing={focused}>
    {#if active && active.blocked > 0}
      <span class="omni-shield mono" title="{active.blocked} requests blocked by the shield on this tab">&#x26E8;{active.blocked}</span>
    {/if}
    <input
      bind:this={omnibox}
      bind:value={draft}
      placeholder="Search or enter address"
      spellcheck="false"
      onfocus={() => { focused = true; omnibox?.select(); }}
      onblur={() => (focused = false)}
      onkeydown={(e) => {
        if (e.key === 'Enter') submit();
        else if (e.key === 'Escape') escape();
      }}
    />
  </div>

  <button
    class="nav star"
    class:filled={browser.isBookmarked()}
    disabled={isStart}
    onclick={() => browser.toggleBookmark()}
    aria-label="Bookmark this page"
    title="Bookmark"
  >&#x2605;</button>
  <button
    class="nav"
    onclick={() => invokeSafe('open_palette')}
    aria-label="Command palette"
    title="Command palette (Ctrl+K)"
  ><span class="mono kbd">Ctrl K</span></button>

  <button
    class="nav engine-btn"
    onclick={() => {
      const ids = ENGINES.map((e) => e.id);
      const i = ids.indexOf(browser.session.engine);
      browser.setEngine(ids[(i + 1) % ids.length]);
    }}
    title="Search engine: click to switch (currently {engineName})"
  ><span class="mono kbd">{engineName}</span></button>

  <button
    class="nav"
    onclick={() => browser.setTheme(browser.session.theme === 'dark' ? 'light' : 'dark')}
    aria-label="Toggle theme"
    title="Toggle light/dark"
  >{browser.session.theme === 'dark' ? '&#x263C;' : '&#x263D;'}</button>

  <span class="gap"></span>

  {#if document?.documentElement?.dataset?.platform !== 'macos'}
    <button class="nav" onclick={() => winCtl('minimize')} aria-label="Minimize">&#x2500;</button>
    <button class="nav" onclick={() => winCtl('toggleMaximize')} aria-label="Maximize">&#x25A1;</button>
    <button class="nav close" onclick={() => winCtl('close')} aria-label="Close">&#x2715;</button>
  {/if}
</div>

<style>
  .bar {
    height: 52px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 10px;
  }

  .nav {
    flex: none;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--ink-soft);
    font-size: 13px;
    display: grid;
    place-items: center;
    cursor: default;
  }
  .nav:hover:not(:disabled) { background: var(--raised); color: var(--ink); }
  .nav:disabled { opacity: 0.35; }

  .star.filled { color: var(--accent); }

  .kbd {
    font-size: 9px;
    letter-spacing: 0.4px;
  }

  .omni {
    flex: 1;
    min-width: 0;
    height: 34px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 14px;
    border-radius: 17px;
    background: var(--raised);
    border: 1px solid var(--hairline);
    transition: border-color 120ms ease, box-shadow 120ms ease;
  }
  /* macOS: the omnibox is the hero glass capsule */
  :global(html[data-platform='macos']) .omni {
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(26px) saturate(1.7);
    -webkit-backdrop-filter: blur(26px) saturate(1.7);
    border: 0.5px solid rgba(255, 255, 255, 0.55);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.65),
      inset 0 -1px 0 rgba(255, 255, 255, 0.18),
      0 2px 12px rgba(20, 32, 43, 0.06);
  }
  .omni.editing {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .omni input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--ink);
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-size: 12.5px;
  }
  .omni input::placeholder { color: var(--ink-soft); }

  .omni-shield { font-size: 10px; color: var(--warn); }

  .gap { flex: 1; }

  .close:hover { background: var(--warn); color: #fff; }

  .engine-btn {
    width: auto;
    padding: 0 10px;
    font-size: 11px;
    color: var(--ink-soft);
    white-space: nowrap;
  }
  .engine-btn:hover { color: var(--ink); background: var(--raised); }
</style>