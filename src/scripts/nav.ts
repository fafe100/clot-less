/**
 * Nav scroll state and mobile menu.
 *
 * Scroll state is driven by an IntersectionObserver on a 1px sentinel, NOT a
 * scroll listener. Scroll handlers run on the main thread every frame, which is
 * exactly what you cannot afford next to a backdrop-filter element.
 *
 * Every navigation on this site is a full document load, so this runs once per
 * page against a fresh `document`. Nothing survives a page change, and nothing
 * here needs tearing down.
 */
export function initNav(): void {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  const sentinel = document.querySelector<HTMLElement>('[data-nav-sentinel]');

  if (nav && sentinel) {
    const observer = new IntersectionObserver(
      (entries) => {
        // Batched records arrive oldest-first, so the last one is the truth.
        const entry = entries[entries.length - 1]!;
        nav.classList.toggle('is-scrolled', !entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(sentinel);
  }

  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (!toggle || !menu) return;

  const main = document.querySelector<HTMLElement>('#main');
  const footer = document.querySelector<HTMLElement>('footer');
  const close = menu.querySelector<HTMLButtonElement>('[data-menu-close]');

  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.toggleAttribute('data-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';

    /* The sheet covers the page but is not a <dialog>, so nothing stops a
       keyboard or screen-reader user tabbing straight into the content behind
       it. `inert` removes that content from the tab order and the a11y tree
       for as long as the menu is open. */
    main?.toggleAttribute('inert', open);
    footer?.toggleAttribute('inert', open);

    /* Focus lands on the close button rather than the first link. The burger
       that opened the menu is outside this dialog and aria-modal hides it, so
       the exit is what a screen-reader user needs within reach first. */
    if (open) close?.focus();
  };

  toggle.addEventListener('click', () =>
    setOpen(toggle.getAttribute('aria-expanded') !== 'true'),
  );

  close?.addEventListener('click', () => {
    setOpen(false);
    toggle.focus();
  });

  /* A tap on a link, or on the scrim around the sheet, dismisses it. The scrim
     case is bound to `click` and not `pointerdown`: the sheet scrolls when it
     is taller than the viewport, and the natural way to scroll it is a drag
     that begins on the scrim — on pointerdown that closed the menu the instant
     the finger touched down. */
  menu.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target === menu || target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  /* Android's back gesture freezes the document into the bfcache exactly as it
     stands. Come back to it with the menu open and the restored page has
     `html { overflow: hidden }`, an inert <main> and a sheet nothing will
     dismiss — a page that looks fine and does nothing. Restoring from the
     bfcache re-runs no module, so this is the only hook there is. */
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) setOpen(false);
  });

  /* Crossing the desktop breakpoint while the menu is open used to strand the
     page: the sheet and the burger both become display:none at ≥860px, but
     `aria-expanded` stayed true and `html { overflow: hidden }` stayed applied,
     leaving the page unscrollable with no visible control to undo it. Rotating
     a phone to landscape was enough to trigger it. */
  const desktop = window.matchMedia('(min-width: 860px)');
  desktop.addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}
