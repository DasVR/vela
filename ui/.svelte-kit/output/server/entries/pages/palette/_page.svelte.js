import { a9 as attr, a7 as ensure_array_like, a8 as attr_class, e as escape_html } from "../../../chunks/index.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let filtered = [];
    let q = "";
    let sel = 0;
    $$renderer2.push(`<div class="pal svelte-17h97wo"><input${attr("value", q)} placeholder="Type to search tabs, bookmarks, history, commands" spellcheck="false" aria-label="Command palette" class="svelte-17h97wo"/> <ul role="listbox" class="svelte-17h97wo"><!--[-->`);
    const each_array = ensure_array_like(filtered);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let r = each_array[i];
      $$renderer2.push(`<li role="option"${attr("aria-selected", i === sel)}${attr_class("svelte-17h97wo", void 0, { "sel": i === sel })}><span class="kind mono svelte-17h97wo">${escape_html(r.kind === "tab" ? "tab" : r.kind === "cmd" ? "cmd" : r.source)}</span> <span class="label svelte-17h97wo">${escape_html(r.label)}</span> <span class="hint mono svelte-17h97wo">${escape_html(r.hint)}</span></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div>`);
  });
}
export {
  _page as default
};
