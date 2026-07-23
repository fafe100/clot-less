/**
 * Scroll reveals.
 *
 * Elements are unobserved once they fire — content never re-animates on the way
 * back up. Under prefers-reduced-motion nothing is observed at all; everything
 * is simply marked visible.
 *
 * The previous observer is disconnected on re-init, since `boot()` runs again
 * after every client-side navigation.
 */
declare global {
  interface Window {
    __revealFailsafe?: ReturnType<typeof setTimeout>;
  }
}

let observer: IntersectionObserver | null = null;

export function initReveal(): void {
  // This module is now in charge of the hidden state, so cancel the inline
  // failsafe that would otherwise strip .js-reveal after 2s.
  if (window.__revealFailsafe !== undefined) {
    clearTimeout(window.__revealFailsafe);
    window.__revealFailsafe = undefined;
  }

  observer?.disconnect();
  observer = null;

  const items = document.querySelectorAll<HTMLElement>('.reveal');
  if (items.length === 0) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.1 },
  );

  items.forEach((el) => {
    if (el.classList.contains('is-visible')) return;
    observer!.observe(el);
  });
}
