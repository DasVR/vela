import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  clearScreen: false,
  // relative base: absolute /_app/... imports fail under tauri:// protocol
  base: './',
  server: {
    port: 1420,
    strictPort: true
  },
  build: {
    target: 'safari16'
  }
});