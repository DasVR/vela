<script lang="ts">
  import { browser, invokeSafe } from '$lib/browser.svelte';
  import { ENGINES, engineById } from '$lib/sites';
  import Icon from '$lib/components/Icon.svelte';

  let draft = $state('');
  let focused = $state(false);
  let omnibox: HTMLInputElement | undefined = $state();
  // the url the draft mirrors; submit only navigates when the draft was
  // actually edited away from it (typed input), never re-submits a mirror
  let mirrored = $state('');

  // mirror the active tab's url into the omnibox when not editing
  $effect(() => {
    if (focused) return;
    const a = browser.active;
    const url = a && a.kind === 'page' ? a.url : '';
    mirrored = url;
    draft = url;
  });

  window.addEventListener('vela:focus-omnibox', () => {
    omnibox?.focus();
    omnibox?.select();
  });

  function submit() {
    const a = browser.active;
    if (!a) return;
    const input = draft.trim();
    if (!input) return;
    // unchanged mirror (user just pressed Enter on the copied url) = reload
    // at most; do NOT treat it as a fresh query
    if (input === mirrored && a.kind === 'page') {
      browser.reload(a.id);
      omnibox?.blur();
      return;
    }
    browser.navigate(a.id, input);
    omnibox?.blur();
  }

  function escape() {
    draft = mirrored;
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

  function cycleEngine() {
    const ids = ENGINES.map((e) => e.id);
    const i = ids.indexOf(browser.session.engine);
    browser.setEngine(ids[(i + 1) % ids.length]);
  }

  const active = $derived(browser.active);
  const isStart = $derived(!active || active.kind === 'start');
  const engine = $derived(engineById(browser.session.engine));
  const status = $derived.by(() => {
    if (!active || active.kind === 'start') {
      return { name: 'search' as const, warn: false, title: undefined as string | undefined };
    }
    if (active.url.startsWith('http://')) {
      return { name: 'lock' as const, warn: true, title: 'Not secure' };
    }
    return { name: 'lock' as const, warn: false, title: undefined };
  });
</script>

<div class="bar">
  <button
    class="nav"
    disabled={isStart}
    onclick={() => active && browser.back(active.id)}
    aria-label="Back"
    title="Back (Alt+←)"
  ><Icon name="back" /></button>
  <button
    class="nav"
    disabled={isStart}
    onclick={() => active && browser.forward(active.id)}
    aria-label="Forward"
    title="Forward (Alt+→)"
  ><Icon name="forward" /></button>
  <button
    class="nav"
    disabled={isStart}
    onclick={() => active && browser.reload(active.id)}
    aria-label="Reload"
    title="Reload"
  ><Icon name="reload" /></button>

  <div class="omni" class:editing={focused}>
    <span
      class="status"
      class:warn={status.warn}
      title={status.title}
    ><Icon name={status.name} size={18} /></span>
    {#if active && active.blocked > 0}
      <span class="omni-shield mono" title="{active.blocked} requests blocked by the shield on this tab">
        <Icon name="shield" size={12} />{active.blocked}
      </span>
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
    <button
      type="button"
      class="engine-chip mono"
      onclick={cycleEngine}
      title="Search engine: click to switch (currently {engine.name})"
    >
      <span class="dot" style="background:{engine.dot}"></span>
      {engine.short}
    </button>
  </div>

  <button
    class="nav star"
    class:filled={browser.isBookmarked()}
    disabled={isStart}
    onclick={() => browser.toggleBookmark()}
    aria-label="Bookmark this page"
    title="Bookmark"
  ><Icon name={browser.isBookmarked() ? 'starFill' : 'star'} /></button>
  <button
    class="nav"
    onclick={() => invokeSafe('open_palette')}
    aria-label="Command palette"
    title="Command palette (Ctrl+K)"
  ><span class="mono kbd">Ctrl K</span></button>

  <button
    class="nav"
    onclick={() => browser.setTheme(browser.session.theme === 'dark' ? 'light' : 'dark')}
    aria-label="Toggle theme"
    title="Toggle light/dark"
  ><Icon name={browser.session.theme === 'dark' ? 'sun' : 'moon'} /></button>

  <span class="gap"></span>

  {#if document?.documentElement?.dataset?.platform !== 'macos'}
    <button class="nav" onclick={() => winCtl('minimize')} aria-label="Minimize">&#x2500;</button>
    <button class="nav" onclick={() => winCtl('toggleMaximize')} aria-label="Maximize">&#x25A1;</button>
    <button class="nav close" onclick={() => winCtl('close')} aria-label="Close"><Icon name="close" /></button>
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
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--ink-soft);
    font-size: 13px;
    display: grid;
    place-items: center;
    cursor: default;
    transition: color 120ms ease, background 120ms ease;
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
    padding: 0 8px 0 10px;
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

  .status {
    flex: none;
    width: 18px;
    height: 18px;
    display: grid;
    place-items: center;
    color: var(--ink-soft);
  }
  .status.warn { color: var(--warn); }

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

  .omni-shield {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 10px;
    color: var(--warn);
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
  :global(html[data-platform='macos']) .engine-chip {
    background: transparent;
  }
  .engine-chip:hover { color: var(--ink); }
  .engine-chip .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex: none;
  }

  .gap { flex: 1; }

  .close:hover { background: var(--warn); color: #fff; }

  /* Ctrl+K is wider than icon buttons */
  .nav:has(.kbd) {
    width: auto;
    padding: 0 8px;
  }
</style>
