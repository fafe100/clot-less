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
      ([entry]) => {
        nav.classList.toggle('is-scrolled', !entry!.isIntersecting);
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

    if (open) {
      menu.querySelector<HTMLAnchorElement>('a')?.focus();
    }
  };

  toggle.addEventListener('click', () =>
    setOpen(toggle.getAttribute('aria-expanded') !== 'true'),
  );

  menu.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  // Tapping the scrim closes it. Without this the only exits are a nav link or
  // the Escape key, and a touch user has neither instinct nor a keyboard.
  menu.addEventListener('pointerdown', (e) => {
    if (e.target === menu) setOpen(false);
  });

  /* Crossing the desktop breakpoint while the menu is open used to strand the
     page: the sheet and the burger both become display:none at ≥860px, but
     `aria-expanded` stayed true and `html { overflow: hidden }` stayed applied,
     leaving the page unscrollable with no visible control to undo it. Rotating
     a phone to landscape was enough to trigger it. */
  const desktop = window.matchMedia('(width >= 860px)');
  desktop.addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}
