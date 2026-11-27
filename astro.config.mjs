// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://portfolio.shresthanischhal.com.np',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',            // about.astro -> about.html, served at /about
    inlineStylesheets: 'never' // strict CSP: no inline CSS
  },
  devToolbar: { enabled: false }
});
