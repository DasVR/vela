//! Shield v1: cosmetic ad/tracker-slot hiding, injected at document start
//! into every page webview. Network-level filtering is a v2 item (needs a
//! local filtering proxy or WebKitGTK extension API — wry does not expose
//! per-request http/https interception portably).

pub const COSMETIC_JS: &str = r#"
(function () {
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
  var SEL = [
    'a[href*="doubleclick.net"]',
    'iframe[src*="doubleclick.net"]',
    'iframe[src*="googlesyndication"]',
    'iframe[src*="googletagmanager.com"]',
    'iframe[src*="adservice.google"]',
    'iframe[src*="adnxs"]',
    'iframe[src*="taboola.com"]',
    'iframe[src*="outbrain.com"]',
    'div[id^="google_ads"]',
    'div[id^="div-gpt-ad"]',
    'div[id^="taboola-"]',
    'ins.adsbygoogle'
  ].join(',');
  var n = 0;
  function hide() {
    try {
      document.querySelectorAll(SEL).forEach(function (el) {
        if (el.style.display !== 'none') { el.style.display = 'none'; el.style.height = '0'; n++; }
      });
    } catch (e) {}
  }
  hide();
  var i = 0, t = setInterval(function () { hide(); if (++i > 12) clearInterval(t); }, 1500);

  // report this page's title back to the browser core
  try {
    var send = function () {
      try { window.__TAURI_INTERNALS__.invoke('report_title', { title: document.title || '' }); } catch (e) {}
    };
    send();
    new MutationObserver(function () { send(); }).observe(
      document.querySelector('title') || document.head || document.documentElement,
      { childList: true, subtree: true, characterData: true }
    );
  } catch (e) {}
})();
"#;
