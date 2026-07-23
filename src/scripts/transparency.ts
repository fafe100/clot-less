/**
 * Manual "reduce transparency" control.
 *
 * This is mandatory, not a nicety. `prefers-reduced-transparency` has only
 * limited availability across browsers, so the media query alone leaves the
 * accessibility requirement unmet for most visitors. The preference is applied
 * pre-paint by an inline <head> script (see BaseLayout) so there is no flash.
 */
const KEY = 'clotless:transparency';

export function initTransparencyToggle(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-transparency-toggle]');
  if (!toggle) return;

  // The label stays fixed and aria-pressed carries the state. Swapping the
  // label too would double up the announcement and leave it ambiguous whether
  // the text describes the current state or the action.
  const sync = () => {
    const reduced = document.documentElement.dataset.transparency === 'reduce';
    toggle.setAttribute('aria-pressed', String(reduced));
  };

  toggle.addEventListener('click', () => {
    const reduced = document.documentElement.dataset.transparency === 'reduce';
    if (reduced) {
      delete document.documentElement.dataset.transparency;
    } else {
      document.documentElement.dataset.transparency = 'reduce';
    }

    // Persistence is best-effort: setItem throws in Safari private browsing and
    // partitioned-storage contexts. The toggle must still work for this
    // session, so the failure must not abort the sync below.
    try {
      localStorage.setItem(KEY, reduced ? 'auto' : 'reduce');
    } catch (_) {}

    sync();
  });

  sync();
}
