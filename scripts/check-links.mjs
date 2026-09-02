import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

// Read `base` straight from the Astro config so this check cannot drift from
// the deploy configuration.
const CONFIG = readFileSync(new URL('../astro.config.mjs', import.meta.url).pathname, 'utf8');
const BASE = (CONFIG.match(/base:\s*['"]([^'"]+)['"]/)?.[1] ?? '').replace(/\/$/, '');

/** Strip the deploy base off an app-absolute href. Returns null if it is missing. */
function unbase(pathname) {
  if (!BASE) return pathname;
  if (pathname === BASE) return '/';
  if (pathname.startsWith(BASE + '/')) return pathname.slice(BASE.length);
  return null; // link is missing the base prefix -> would 404 in production
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));

/** Does an internal path resolve to something in dist/? */
function resolves(pathname) {
  const clean = pathname.replace(/\/$/, '');
  const candidates = [
    join(DIST, clean),
    join(DIST, clean + '.html'),       // build.format: 'file'
    join(DIST, clean, 'index.html'),   // build.format: 'directory'
  ];
  if (clean === '') return existsSync(join(DIST, 'index.html'));
  return candidates.some((c) => existsSync(c) && statSync(c).isFile());
}

/** Route path a built file answers to, normalised across both build formats. */
function pageId(file) {
  const rel = relative(DIST, file)
    .replace(/index\.html$/, '')
    .replace(/\.html$/, '')
    .replace(/\/$/, '');
  return '/' + rel;
}

const broken = [];
const externals = new Set();
const allIds = new Map(); // page -> Set of ids

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const page = pageId(file);
  allIds.set(
    page,
    new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])),
  );
}

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const page = pageId(file);

  // href and src attributes
  const refs = [
    ...[...html.matchAll(/\shref="([^"]+)"/g)].map((m) => ['href', m[1]]),
    ...[...html.matchAll(/\ssrc="([^"]+)"/g)].map((m) => ['src', m[1]]),
  ];

  for (const [attr, raw] of refs) {
    if (raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('data:')) continue;
    if (/^https?:\/\//.test(raw)) {
      externals.add(raw);
      continue;
    }
    if (raw.startsWith('#')) {
      const id = decodeURIComponent(raw.slice(1));
      if (!allIds.get(page)?.has(id)) {
        broken.push({ page, attr, raw, why: 'anchor id not found on page' });
      }
      continue;
    }
    if (!raw.startsWith('/')) {
      broken.push({ page, attr, raw, why: 'relative link (unexpected)' });
      continue;
    }

    const [rawPath, hash] = raw.split('#');

    const pathname = unbase(rawPath);
    if (pathname === null) {
      broken.push({ page, attr, raw, why: `missing base prefix "${BASE}" -> 404 in production` });
      continue;
    }

    // Static assets
    if (/\.[a-z0-9]{2,5}$/i.test(pathname)) {
      if (!existsSync(join(DIST, pathname))) {
        broken.push({ page, attr, raw, why: 'asset missing in dist/' });
      }
      continue;
    }
    if (!resolves(pathname)) {
      broken.push({ page, attr, raw, why: 'page not built' });
      continue;
    }
    if (hash) {
      const target = pathname.replace(/\/$/, '') || '/';
      const ids = allIds.get(target);
      if (ids && !ids.has(decodeURIComponent(hash))) {
        broken.push({ page, attr, raw, why: `anchor #${hash} not found on ${target}` });
      }
    }
  }
}

console.log(`Deploy base: ${BASE || '(none)'}`);
console.log(`HTML pages checked: ${htmlFiles.length}`);
console.log(`External links (not fetched): ${externals.size}`);
for (const e of [...externals].sort()) console.log(`   ${e}`);
console.log(`\nBROKEN: ${broken.length}`);
for (const b of broken) {
  console.log(`  ${b.page}  [${b.attr}] ${b.raw}  -> ${b.why}`);
}
process.exit(broken.length ? 1 : 0);
