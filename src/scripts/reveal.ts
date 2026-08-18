/**
 * Scroll reveals.
 *
 * This is a plain multi-page site: every navigation is a full document load, so
 * this module runs exactly once per page and nothing it sets outlives the page.
 * There is no re-init to guard against and no listener that can accumulate.
 *
 * Anything already on screen when the module runs is revealed IMMEDIATELY, with
 * the transition suppressed so it lands painted rather than fading in. Fading
 * content the visitor can already see costs 480ms plus up to 360ms of stagger on
 * every single page change, which reads as the page being slow rather than as
 * polish. Only content below the fold keeps the fade, which is the effect the
 * reveal exists for.
 *
 * Elements are unobserved once they fire — content never re-animates on the way
 * back up. Under prefers-reduced-motion nothing is observed at all; everything
 * is simply marked visible.
 */
declare global {
  interface Window {
    __revealFailsafe?: ReturnType<typeof setTimeout>;
  }
}

export function initReveal(): void {
  // This module is now in charge of the hidden state, so cancel the inline
  // failsafe that would otherwise strip .js-reveal after 2s.
  if (window.__revealFailsafe !== undefined) {
    clearTimeout(window.__revealFailsafe);
    window.__revealFailsafe = undefined;
  }

  const items = document.querySelectorAll<HTMLElement>('.reveal');
  if (items.length === 0) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    },
    /* threshold MUST stay 0. A threshold is a fraction of the ELEMENT, not of
       the viewport, so an element taller than the visible area can never reach
       0.1 and would stay at opacity 0 for the entire session. The gallery grid
       is one element ~4600px tall; on a short phone in landscape it was exactly
       that — permanently invisible, with the inline failsafe already cancelled. */
    { rootMargin: '0px 0px -12% 0px', threshold: 0 },
  );

  const instant: HTMLElement[] = [];

  items.forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.style.transition = 'none';
      el.classList.add('is-visible');
      instant.push(el);
      return;
    }
    observer.observe(el);
  });

  /* Two frames, not one. A transition is decided at style recalculation, and
     the first rAF callback runs BEFORE the frame it belongs to is recalculated
     — clearing the override there would hand the element back its transition in
     the same recalc that first sees opacity:1, and it would fade after all. By
     the second callback the browser has already recorded the element as visible
     with transitions off, so restoring them changes nothing. */
  if (instant.length > 0) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        instant.forEach((el) => { el.style.transition = ''; });
      });
    });
  }
}
