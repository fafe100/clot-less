/**
 * Post-build cleanup and one build-time guard. Zero dependencies, so it can
 * never be the reason a deploy fails to install.
 *
 * PRUNE — Astro copies the original of every imported image into dist/_astro/
 * alongside the optimised renditions, and leaves it there whether or not
 * anything points at it. A sponsor marked `draft: true` is the common case: its
 * logo is still imported by the glob in src/lib/images.ts, so the .png ships,
 * but no page references it. Any .jpg/.png in dist/_astro/ whose filename
 * appears in no emitted HTML, CSS or JS is dead weight on the deploy and is
 * deleted here.
 *
 * ASSERT — the mobile menu is the only interactive element on the site that a
 * visitor cannot work around, and it depends on the boot module being present.
 * Vite inlines a module chunk under 4KB into the document and emits it as a
 * separate request above that. Both work, but the inline form is what has been
 * measured, so a silent crossing of that threshold should be visible at build
 * time rather than in production. Exits non-zero if the marker is gone.
 */
import { readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const assets = join(dist, '_astro');

/** Every emitted file, recursively. */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

// ── Prune unreferenced originals ────────────────────────────────────────────
const referenced = walk(dist)
  .filter((f) => /\.(html|css|js)$/.test(f))
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n');

let freed = 0;
const pruned = [];

for (const name of readdirSync(assets)) {
  if (!/\.(jpe?g|png)$/i.test(name) || referenced.includes(name)) continue;
  const path = join(assets, name);
  freed += statSync(path).size;
  rmSync(path);
  pruned.push(name);
}

console.log(
  pruned.length === 0
    ? 'prune: no unreferenced originals in dist/_astro/'
    : `prune: removed ${pruned.length} unreferenced original${pruned.length === 1 ? '' : 's'} ` +
      `(${(freed / 1024).toFixed(1)} KB) — ${pruned.join(', ')}`,
);

// ── Assert the nav script is still inlined ──────────────────────────────────
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const inlineScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
  .filter(([, attrs]) => !/\ssrc=/.test(attrs))
  .map(([, , body]) => body);

if (!inlineScripts.some((body) => body.includes('data-menu-toggle'))) {
  console.error(
    'assert FAILED: no inline <script> in dist/index.html references ' +
      '[data-menu-toggle].\nThe boot module has grown past Vite\'s 4096-byte ' +
      'inlining threshold and is now a separate request, or the mobile menu ' +
      'wiring has moved. Verify the menu still opens before deploying.',
  );
  process.exit(1);
}

console.log('assert: nav boot script is inlined in dist/index.html');
