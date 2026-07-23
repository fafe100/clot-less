/**
 * BASE_URL-safe href builder.
 *
 * Every internal link and every public/ asset path goes through this. It is
 * what turns a future move to a project-path host (user.github.io/Flux-Markdown/)
 * into a one-line config change instead of a site-wide audit.
 */
const BASE = import.meta.env.BASE_URL;

export function link(path: string): string {
  if (/^([a-z]+:)?\/\//i.test(path) || path.startsWith('#')) {
    return path;
  }
  const base = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const rest = path.startsWith('/') ? path : `/${path}`;
  return `${base}${rest}`;
}

/**
 * True when `href` is the current page — used for nav active state.
 *
 * Pass an href that has ALREADY been through `link()`. `Astro.url.pathname` is
 * base-prefixed, so comparing it against a raw '/about' silently returns false
 * on every page the moment a `base` is configured.
 */
export function isCurrent(href: string, pathname: string): boolean {
  const normalise = (p: string) => {
    const stripped = p.replace(/\.html$/, '').replace(/\/+$/, '');
    return stripped === '' ? '/' : stripped;
  };
  return normalise(href) === normalise(pathname);
}
