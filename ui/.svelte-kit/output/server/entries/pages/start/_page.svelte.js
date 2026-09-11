import { e as escape_html, a9 as attr, ab as stringify, aa as attr_style, a7 as ensure_array_like, a5 as derived } from "../../../chunks/index.js";
import { I as Icon, t as tileFor, Q as QUICK_LINKS, e as engineById } from "../../../chunks/Icon.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let now = /* @__PURE__ */ new Date();
    let recents = [];
    let bookmarks = [];
    let engine = "duckduckgo";
    let query = "";
    const hhmmss = derived(() => [now.getHours(), now.getMinutes(), now.getSeconds()].map((n) => String(n).padStart(2, "0")).join(":"));
    const dateLine = derived(() => now.toLocaleDateString(void 0, { weekday: "long", month: "long", day: "numeric" }));
    const greeting = derived(() => now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening");
    const engineInfo = derived(() => engineById(engine));
    $$renderer2.push(`<div class="page svelte-jk7o5r"><div class="greeting svelte-jk7o5r">${escape_html(greeting())}</div> <div class="clock mono svelte-jk7o5r" aria-hidden="true">${escape_html(hhmmss())}</div> <div class="date svelte-jk7o5r">${escape_html(dateLine())}</div> <form class="search svelte-jk7o5r"><span class="search-icon svelte-jk7o5r">`);
    Icon($$renderer2, { name: "search", size: 18 });
    $$renderer2.push(`<!----></span> <input${attr("value", query)} placeholder="Search or enter address" spellcheck="false" aria-label="Search or enter address" class="svelte-jk7o5r"/> <button type="button" class="engine-chip mono svelte-jk7o5r"${attr("title", `Search engine: click to switch (currently ${stringify(engineInfo().name)})`)}><span class="dot svelte-jk7o5r"${attr_style(`background:${stringify(engineInfo().dot)}`)}></span> ${escape_html(engineInfo().short)}</button></form> <nav class="tiles svelte-jk7o5r" aria-label="Quick links"><!--[-->`);
    const each_array = ensure_array_like(QUICK_LINKS);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let q = each_array[$$index];
      $$renderer2.push(`<button class="tile svelte-jk7o5r"${attr("title", q.url)}><span class="tile-badge mono svelte-jk7o5r"${attr_style(`background:${stringify(tileFor(q.url).bg)};color:${stringify(tileFor(q.url).fg)}`)}>${escape_html(tileFor(q.url).label)}</span> <span class="tile-name svelte-jk7o5r">${escape_html(q.name)}</span></button>`);
    }
    $$renderer2.push(`<!--]--></nav> `);
    if (bookmarks.length) {
      $$renderer2.push(`<!--[0--><section class="row svelte-jk7o5r"><h2 class="svelte-jk7o5r">Bookmarks</h2> <div class="chips svelte-jk7o5r"><!--[-->`);
      const each_array_1 = ensure_array_like(bookmarks.slice(0, 8));
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let b = each_array_1[$$index_1];
        $$renderer2.push(`<button class="chip svelte-jk7o5r"${attr("title", b.url)}><span class="mono badge svelte-jk7o5r"${attr_style(`background:${stringify(tileFor(b.url).bg)};color:${stringify(tileFor(b.url).fg)}`)}>${escape_html(tileFor(b.url).label)}</span> <span class="name svelte-jk7o5r">${escape_html(b.title || b.url)}</span></button>`);
      }
      $$renderer2.push(`<!--]--></div></section>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (recents.length) {
      $$renderer2.push(`<!--[0--><section class="row svelte-jk7o5r"><h2 class="svelte-jk7o5r">Recent</h2> <div class="chips svelte-jk7o5r"><!--[-->`);
      const each_array_2 = ensure_array_like(recents);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let r = each_array_2[$$index_2];
        $$renderer2.push(`<button class="chip svelte-jk7o5r"${attr("title", r.url)}><span class="mono badge svelte-jk7o5r"${attr_style(`background:${stringify(tileFor(r.url).bg)};color:${stringify(tileFor(r.url).fg)}`)}>${escape_html(tileFor(r.url).label)}</span> <span class="name svelte-jk7o5r">${escape_html(r.title || r.url)}</span></button>`);
      }
      $$renderer2.push(`<!--]--></div></section>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
