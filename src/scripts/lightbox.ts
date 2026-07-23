/**
 * Gallery lightbox built on native <dialog>.
 *
 * Using the platform element rather than a div means focus trapping, ESC to
 * close, inert background and the ::backdrop pseudo-element all come free and
 * correct — several hundred bytes instead of a modal library.
 */
type Item = { full: string; alt: string; caption: string; phase: string };

/** Torn down and re-established on each boot, so repeated init can't double-bind. */
let controller: AbortController | null = null;

export function initLightbox(): void {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  const grid = document.querySelector<HTMLElement>('[data-gallery]');
  if (!dialog || !grid) return;

  const img = dialog.querySelector<HTMLImageElement>('[data-lightbox-img]')!;
  const meta = dialog.querySelector<HTMLElement>('[data-lightbox-meta]')!;
  const caption = dialog.querySelector<HTMLElement>('[data-lightbox-caption]')!;
  const phaseEl = dialog.querySelector<HTMLElement>('[data-lightbox-phase]')!;
  const counter = dialog.querySelector<HTMLElement>('[data-lightbox-counter]')!;

  const triggers = Array.from(grid.querySelectorAll<HTMLButtonElement>('[data-lightbox-open]'));
  let index = 0;
  let lastFocused: HTMLElement | null = null;

  const read = (el: HTMLElement): Item => ({
    full: el.dataset.full ?? '',
    alt: el.dataset.alt ?? '',
    caption: el.dataset.caption ?? '',
    phase: el.dataset.phase ?? '',
  });

  /** Only photos currently passing the category filter are navigable. */
  const visible = () => triggers.filter((t) => !t.closest('[hidden]') && t.offsetParent !== null);

  function show(i: number) {
    const pool = visible();
    if (pool.length === 0) return;
    index = (i + pool.length) % pool.length;
    const item = read(pool[index]!);

    img.src = item.full;
    img.alt = item.alt;
    caption.textContent = item.caption;
    caption.hidden = item.caption === '';
    phaseEl.textContent = item.phase;
    phaseEl.hidden = item.phase === '';
    // Photos without a metadata sidecar have neither — hide the whole plate
    // rather than leaving an empty glass slab under the image.
    meta.hidden = item.caption === '' && item.phase === '';
    counter.textContent = `${index + 1} / ${pool.length}`;
  }

  grid.addEventListener(
    'click',
    (e) => {
      const trigger = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-lightbox-open]');
      if (!trigger) return;
      lastFocused = trigger;
      show(visible().indexOf(trigger));
      dialog.showModal();
    },
    { signal },
  );

  dialog.querySelector('[data-lightbox-prev]')
    ?.addEventListener('click', () => show(index - 1), { signal });
  dialog.querySelector('[data-lightbox-next]')
    ?.addEventListener('click', () => show(index + 1), { signal });
  dialog.querySelector('[data-lightbox-close]')
    ?.addEventListener('click', () => dialog.close(), { signal });

  dialog.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    },
    { signal },
  );

  // Click the backdrop (outside the figure) to dismiss.
  dialog.addEventListener(
    'click',
    (e) => {
      if (e.target === dialog) dialog.close();
    },
    { signal },
  );

  // Return focus to the thumbnail that opened it.
  dialog.addEventListener(
    'close',
    () => {
      lastFocused?.focus();
      lastFocused = null;
    },
    { signal },
  );

  // Swipe navigation.
  let startX = 0;
  dialog.addEventListener(
    'touchstart',
    (e) => { startX = e.changedTouches[0]!.clientX; },
    { passive: true, signal },
  );
  dialog.addEventListener(
    'touchend',
    (e) => {
      const dx = e.changedTouches[0]!.clientX - startX;
      if (Math.abs(dx) > 50) show(dx < 0 ? index + 1 : index - 1);
    },
    { passive: true, signal },
  );
}

let filterController: AbortController | null = null;

/** Category filter. Pure attribute toggling — no re-render, no layout thrash. */
export function initGalleryFilter(): void {
  filterController?.abort();
  filterController = new AbortController();

  const grid = document.querySelector<HTMLElement>('[data-gallery]');
  const bar = document.querySelector<HTMLElement>('[data-gallery-filter]');
  if (!grid || !bar) return;

  bar.addEventListener(
    'click',
    (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-category]');
      if (!btn) return;

      const category = btn.dataset.category!;
      bar.querySelectorAll<HTMLButtonElement>('[data-category]').forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });

      let shown = 0;
      grid.querySelectorAll<HTMLElement>('[data-item-category]').forEach((item) => {
        const hide = category !== 'all' && item.dataset.itemCategory !== category;
        item.hidden = hide;
        if (!hide) shown += 1;
      });

      // Without this the on-screen count contradicts the grid, and the change
      // is silent for anyone not watching the layout reflow.
      const count = document.querySelector<HTMLElement>('[data-gallery-count]');
      if (count) {
        const label = btn.textContent?.trim() ?? '';
        count.textContent =
          category === 'all'
            ? `${shown} photograph${shown === 1 ? '' : 's'}`
            : `${shown} photograph${shown === 1 ? '' : 's'} in ${label}`;
      }
    },
    { signal: filterController.signal },
  );
}
