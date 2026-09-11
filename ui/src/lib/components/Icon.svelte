<script lang="ts">
  // Vela icon system — 16×16, stroke 1.5, round caps/joins, currentColor.
  // Drawn once, used everywhere. No unicode glyphs in chrome.
  let { name, size = 15 }: { name: string; size?: number } = $props();

  const P: Record<string, string> = {
    // chevron-based arrows: crisp at 1.5 stroke
    back: 'M9.5 3.5 5 8l4.5 4.5',
    forward: 'M6.5 3.5 11 8l-4.5 4.5',
    // circular arrow, open at top-right
    reload: 'M13 8a5 5 0 1 1-1.7-3.8M13 2.8v2.4h-2.4',
    // five-point star, outline
    star: 'M8 2.6l1.5 3 3.3.5-2.4 2.3.6 3.3L8 10.1l-3 1.6.6-3.3L3.2 6.1l3.3-.5z',
    // same star, filled
    starFill: 'M8 2.6l1.5 3 3.3.5-2.4 2.3.6 3.3L8 10.1l-3 1.6.6-3.3L3.2 6.1l3.3-.5z',
    // shield: rounded kite
    shield: 'M8 2.2l4.4 1.6v3.4c0 2.8-1.8 4.9-4.4 6.6-2.6-1.7-4.4-3.8-4.4-6.6V3.8z',
    plus: 'M8 4v8M4 8h8',
    close: 'M4.5 4.5l7 7M11.5 4.5l-7 7',
    // crescents
    moon: 'M12.5 9.8A5.2 5.2 0 0 1 6.2 3.5a5.4 5.4 0 1 0 6.3 6.3z',
    sun: 'M8 5.2A2.8 2.8 0 1 0 8 10.8 2.8 2.8 0 0 0 8 5.2zM8 2v1.4M8 12.6V14M2 8h1.4M12.6 8H14M3.8 3.8l1 1M11.2 11.2l1 1M12.2 3.8l-1 1M4.8 11.2l-1 1',
    chevDown: 'M4.5 6.5 8 10l3.5-3.5',
    // magnifier
    search: 'M7 2.8a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4zM10.2 10.2 13.5 13.5',
    // closed padlock
    lock: 'M4.5 7.5h7v6h-7zM6 7.5V5.6a2 2 0 0 1 4 0V7.5M8 10.4v1.4'
  };
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 16 16"
  fill={name === 'starFill' ? 'currentColor' : 'none'}
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
><path d={P[name] ?? ''} /></svg>