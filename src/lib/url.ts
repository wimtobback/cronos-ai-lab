/**
 * Path helpers for deployments that live under a sub-path.
 *
 * Astro automatically prefixes `base` onto bundled assets (_astro/*, fonts,
 * astro:assets images). It does NOT touch hand-written href/src strings or
 * anything referenced out of public/. Those must go through withBase().
 *
 * BASE_URL is injected by Vite from `base` in astro.config.mjs, so the repo
 * name is never hardcoded in src/.
 */

/** Prefix an app-absolute path with the deploy base. Other values pass through. */
export function withBase(path: string): string {
  // External URLs, mailto:, tel:, bare fragments and relative paths are not ours.
  if (!path.startsWith('/')) return path;

  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  // The root gets no trailing slash either: `trailingSlash: 'never'` makes
  // `/cronos-ai-lab/` a 404 in `astro dev`. With an empty base (a custom
  // domain) the root is still `/`.
  return path === '/' ? base || '/' : `${base}${path}`;
}

/**
 * Normalise a pathname back to the raw route path it represents, so it can be
 * compared against the plain paths stored in src/config/site.ts.
 *
 * Removes the deploy base, and the .html extension that build.format: 'file'
 * puts into Astro.url.pathname but which never appears in a public URL.
 */
export function stripBase(pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const withoutBase =
    base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;

  return (
    withoutBase
      .replace(/\/index\.html$/, '')
      .replace(/\.html$/, '')
      .replace(/\/$/, '') || '/'
  );
}

/** Fully-qualified URL for canonicals, OG tags and form redirects. */
export function absoluteUrl(path: string, origin: string | URL): string {
  return new URL(withBase(path), origin).href;
}
