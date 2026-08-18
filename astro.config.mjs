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
  // Navigation is the browser's own, so the only cost it can carry is fetching
  // the next document — and prefetch removes it.
  //
  // `hover` rather than `viewport`, because of what prefetched HTML does when a
  // deploy lands mid-session. Chromium keeps a prefetched document usable for
  // five minutes and serves it regardless of max-age, while the host purges the
  // previous build's hashed assets the moment the new one goes live. Prefetch
  // on viewport meant every page in the nav was captured seconds after load, so
  // a visitor who then clicked anything got stale HTML pointing at CSS that now
  // 404s. On hover the prefetch happens 100-300ms before the click instead of
  // minutes, which is still ahead of the navigation and narrows that window to
  // nothing. Touch devices have no hover and fall back to prefetching on
  // touchstart, which is roughly the same head start.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
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
