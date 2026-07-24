// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Canonical origin. clotless.ca is the real home; canrgx.ca redirects here at
  // the DNS/host level so the two domains never compete as separate sites.
  site: 'https://clotless.ca',
  // Root domain, so no path prefix. Every internal link goes through
  // src/lib/link.ts, which means this is the only place a move would matter.
  base: '/',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  // Without this, the ClientRouter cold-fetches each page's HTML on click —
  // the 1–2s stall before a navigation even starts. `viewport` prefetches a
  // link as soon as it is on screen; since the nav is always visible, all six
  // pages are cached shortly after load, so every navigation (including the
  // first) is effectively instant. Six small HTML docs is trivial bandwidth.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  build: {
    // 'directory' emits about/index.html, so `/about` resolves on any static
    // host without rewrite rules. Portable to Netlify, Cloudflare, S3 alike.
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  image: {
    // Sharp handles the responsive derivatives for gallery and team imagery.
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  devToolbar: { enabled: false },
});
