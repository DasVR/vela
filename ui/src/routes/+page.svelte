<script lang="ts">
  // The chrome strip: tab rail + toolbar. Lives in the config window's
  // webview, kept 92px tall by the Rust core. Page content renders in
  // separate child webviews below it.
  import { onMount, onDestroy } from 'svelte';
  import { browser, invokeSafe } from '$lib/browser.svelte';
  import TabRail from '$lib/components/TabRail.svelte';
  import Toolbar from '$lib/components/Toolbar.svelte';

  let unsubs: (() => void)[] = [];

  async function wireEvents() {
    const { listen } = await import('@tauri-apps/api/event');
    const on = (name: string, fn: (p: any) => void) =>
      listen(name, (e) => fn(e.payload)).then((u) => unsubs.push(() => u()));

    await on('tab://loading', (p) => browser.onLoading(p.id, p.loading));
    await on('tab://loaded', (p) => browser.onLoaded(p.id, p.url, p.title || ''));
    await on('tab://title', (p) => browser.onTitle(p.id, p.title));
    await on('tab://blocked', (p) => browser.onBlocked(p.id, p.total));
    await on('tab://url', (p) => browser.onUrl(p.id, p.url));
    await on('palette://go', (p) => {
      if (p.kind === 'url') {
        const a = browser.active;
        if (a) browser.navigate(a.id, p.value);
      } else if (p.kind === 'tab') {
        browser.activate(p.value);
      } else if (p.kind === 'cmd') {
        if (p.value === 'new-tab') browser.openTab('vela://start');
        if (p.value === 'theme') browser.setTheme(browser.session.theme === 'dark' ? 'light' : 'dark');
        if (p.value === 'clear-history') browser.clearHistory();
      }
    });
  }

  function onKey(e: KeyboardEvent) {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); invokeSafe('open_palette'); }
    else if (mod && e.key.toLowerCase() === 't') { e.preventDefault(); browser.openTab('vela://start'); }
    else if (mod && e.key.toLowerCase() === 'w') { e.preventDefault(); const a = browser.active; if (a) browser.closeTab(a.id); }
    else if (mod && e.key.toLowerCase() === 'l') { e.preventDefault(); window.dispatchEvent(new CustomEvent('vela:focus-omnibox')); }
    else if (e.altKey && e.key === 'ArrowLeft') { const a = browser.active; if (a) browser.back(a.id); }
    else if (e.altKey && e.key === 'ArrowRight') { const a = browser.active; if (a) browser.forward(a.id); }
  }

  onMount(() => {
    // platform class for macOS glass spacing
    if (navigator.userAgent.includes('Mac')) {
      document.documentElement.dataset.platform = 'macos';
    }
    browser.init();
    wireEvents();
    window.addEventListener('keydown', onKey);
  });
  onDestroy(() => {
    unsubs.forEach((u) => u());
    window.removeEventListener('keydown', onKey);
  });

  // keep the document theme in sync
  $effect(() => {
    document.documentElement.dataset.theme = browser.session.theme;
  });
</script>

<div class="strip" data-tauri-drag-region>
  <TabRail />
  <Toolbar />
</div>

<style>
  .strip {
    height: 92px;
    display: flex;
    flex-direction: column;
    background: var(--strip);
    border-bottom: 1px solid var(--hairline);
    user-select: none;
    overflow: hidden;
  }
</style>