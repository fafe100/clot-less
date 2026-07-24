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
let firstRun = true;

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

  // On the first page load the whole viewport fades in — a deliberate first
  // impression. But on client-side navigations that same fade makes every page
  // change feel slow: you land and wait ~half a second for the content you
  // navigated to. So after a swap, anything already on screen is shown
  // instantly, and only content below the fold is left to fade in on scroll.
  const revealNow = !firstRun;
  firstRun = false;

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
    if (revealNow && el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add('is-visible');
      return;
    }
    observer!.observe(el);
  });
}
