import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      // SPA for the chrome strip; /start and /palette are prerendered
      // separately (see their +page.ts) so Tauri can load them as
      // standalone windows/webviews in production.
      fallback: 'index.html'
    }),
    // relative asset paths: absolute /_app/... imports fail under the
    // tauri:// custom protocol
    paths: {
      base: '',
      relative: true
    }
  }
};

export default config;