/**
 * Gallery lightbox built on native <dialog>.
 *
 * Using the platform element rather than a div means focus trapping, ESC to
 * close, inert background and the ::backdrop pseudo-element all come free and
 * correct — several hundred bytes instead of a modal library.
 *
 * Runs once per document load; there is no client-side navigation here, so no
 * listener can be bound twice and nothing needs tearing down.
 */
type Item = { full: string; alt: string; caption: string; phase: string };

export function initLightbox(): void {
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

    /* Dim while the next photo is on the wire. Without it the previous photo
       sits under the next one's caption for as long as the fetch takes, which
       reads as the caption being wrong rather than as loading. */
    img.classList.add('is-loading');
    img.src = item.full;
    // Re-showing the same photo never fires `load`, so clear it right back.
    if (img.complete) img.classList.remove('is-loading');
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

  img.addEventListener('load', () => img.classList.remove('is-loading'));

  grid.addEventListener('click', (e) => {
    const trigger = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-lightbox-open]');
    if (!trigger) return;
    lastFocused = trigger;
    show(visible().indexOf(trigger));
    dialog.showModal();
  });

  dialog.querySelector('[data-lightbox-prev]')
    ?.addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-lightbox-next]')
    ?.addEventListener('click', () => show(index + 1));
  dialog.querySelector('[data-lightbox-close]')
    ?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
  });

  // Click the backdrop (outside the figure) to dismiss.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  // Return focus to the thumbnail that opened it.
  dialog.addEventListener('close', () => {
    lastFocused?.focus();
    lastFocused = null;
  });

  /* Swipe navigation, with a pinch guard. A pinch-to-zoom almost never ends
     with both fingers where they started, so the second finger's touchend was
     routinely read as a 50px+ horizontal swipe and jumped to the next photo —
     the moment someone tries to look closer at a build detail is exactly the
     moment they lose it. Any gesture that ever had a second finger down is
     ignored until every finger is back off the glass. */
  let startX = 0;
  let multiTouch = false;

  dialog.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length > 1) multiTouch = true;
      if (multiTouch) return;
      startX = e.changedTouches[0]!.clientX;
    },
    { passive: true },
  );

  dialog.addEventListener(
    'touchend',
    (e) => {
      // Still fingers on the screen: the gesture is not over.
      if (e.touches.length > 0) return;

      const pinched = multiTouch;
      multiTouch = false;
      if (pinched) return;

      const dx = e.changedTouches[0]!.clientX - startX;
      if (Math.abs(dx) > 50) show(dx < 0 ? index + 1 : index - 1);
    },
    { passive: true },
  );
}

/** Category filter. Pure attribute toggling — no re-render, no layout thrash. */
export function initGalleryFilter(): void {
  const grid = document.querySelector<HTMLElement>('[data-gallery]');
  const bar = document.querySelector<HTMLElement>('[data-gallery-filter]');
  if (!grid || !bar) return;

  bar.addEventListener('click', (e) => {
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
      const photos = `${shown} photograph${shown === 1 ? '' : 's'}`;
      count.textContent = category === 'all' ? photos : `${photos} in ${label}`;
    }
  });
}
