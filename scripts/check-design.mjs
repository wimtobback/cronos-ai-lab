// scripts/check-design.mjs
// Executable form of docs/superpowers/specs/2026-08-28-visual-identity-redesign-design.md §3.
// Principle 5 ("every section earns its own shape") is not automatable and is a
// manual gate in the plan instead. Everything else is enforced here.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');

// Task 17 deleted the specimen and ruled-preview throwaway pages, so no
// dist output needs exemption from these rules any more.
const IGNORE = new Set();

const APPROVED_FONTS = ['Azeret Mono', 'Cabinet Grotesk', 'Switzer'];

const failures = [];
const fail = (rule, where, detail) => failures.push({ rule, where, detail });

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const all = walk(DIST);
const htmlFiles = all.filter((f) => f.endsWith('.html') && !IGNORE.has(relative(DIST, f)));
const cssFiles = all.filter((f) => f.endsWith('.css'));
const css = cssFiles.map((f) => ({ name: relative(DIST, f), text: readFileSync(f, 'utf8') }));

/* --- R1 fonts-approved ------------------------------------------------- */
const config = readFileSync(join(ROOT, 'astro.config.mjs'), 'utf8');
const fontsBlock = config.slice(config.indexOf('fonts:'));
const declared = [...fontsBlock.matchAll(/name:\s*'([^']+)'/g)].map((m) => m[1]).sort();
if (JSON.stringify(declared) !== JSON.stringify(APPROVED_FONTS)) {
  fail('fonts-approved', 'astro.config.mjs',
    `declared [${declared.join(', ')}], approved [${APPROVED_FONTS.join(', ')}]`);
}

// Declaring the three approved families in astro.config.mjs doesn't stop
// anyone from hand-writing a serif `font-family` somewhere else — spec
// principle 1 is "Sans-only. No serif face ships," so the built output
// itself has to be checked too. Scans dist/**/*.css plus <style> blocks and
// inline style= attributes in dist/**/*.html (the latter is plain text
// scanning, so it catches both without needing separate parsing).
//
// Tokenizes each font-family list on commas and compares whole tokens —
// never a substring test — because "sans-serif" (a legitimate fallback)
// contains the literal string "serif" and a naive /serif/ regex would flag
// every correct fallback stack on the site.
const SERIF_GENERIC = 'serif';
const SERIF_DENYLIST = [
  'georgia', 'times new roman', 'times', 'garamond',
  'palatino', 'baskerville', 'cambria', 'instrument serif',
];
function findSerifDeclarations(text) {
  const hits = [];
  for (const m of text.matchAll(/font-family:\s*([^;"'}]+)/gi)) {
    const tokens = m[1].split(',').map((p) => p.trim().replace(/^["']|["']$/g, '').toLowerCase());
    if (tokens.some((t) => t === SERIF_GENERIC || SERIF_DENYLIST.includes(t))) {
      hits.push(m[1].trim());
    }
  }
  return hits;
}
for (const { name, text } of css) {
  for (const hit of findSerifDeclarations(text)) {
    fail('fonts-approved', name, `serif font-family declared: ${hit}`);
  }
}
for (const f of htmlFiles) {
  const text = readFileSync(f, 'utf8');
  for (const hit of findSerifDeclarations(text)) {
    fail('fonts-approved', relative(DIST, f), `serif font-family declared: ${hit}`);
  }
}

/* --- R2 display-scale -------------------------------------------------- */
{
  const joined = css.map((c) => c.text).join('');
  const m = joined.match(/--text-display:\s*clamp\(([^)]*)\)/);
  if (!m) {
    fail('display-scale', 'dist/_astro/*.css', '--text-display clamp() not found');
  } else {
    const max = m[1].split(',').pop().trim();
    const rem = parseFloat(max);
    if (!/rem$/.test(max) || rem < 7.5) {
      fail('display-scale', 'dist/_astro/*.css', `max is ${max}, need >= 7.5rem`);
    }
  }
}

/* --- R3 radius-band ---------------------------------------------------- */
// Allowed: <= 8px (hard edges) or >= 999px (pills) or any %/vw (avatars, pills).
// Tailwind's named radius utilities (rounded-xl, rounded-lg, ...) compile to
// `border-radius:var(--radius-xl)` rather than a literal value, so the custom
// properties declared in the same bundle have to be resolved before judging —
// otherwise every named utility parses as NaN and silently passes the gate.
const cssVars = {};
for (const { text } of css) {
  for (const m of text.matchAll(/(--[a-z0-9-]+):\s*([^;}]+)/gi)) {
    cssVars[m[1]] = m[2].trim();
  }
}
function resolveVar(raw, seen = new Set()) {
  const m = raw.match(/^var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([\s\S]+))?\)$/i);
  if (!m) return raw;
  const [, name, fallback] = m;
  if (seen.has(name)) return raw; // circular reference — give up, don't loop
  seen.add(name);
  if (name in cssVars) return resolveVar(cssVars[name], seen);
  if (fallback !== undefined) return resolveVar(fallback.trim(), seen);
  return raw; // genuinely unresolvable
}
function radiusOk(raw) {
  let v = raw.trim().toLowerCase();
  if (v.startsWith('var(')) {
    const resolved = resolveVar(raw.trim());
    if (resolved.trim().toLowerCase() === v) return false; // unresolved var() — report, don't guess
    v = resolved.trim().toLowerCase();
  }
  if (v === '0' || v === 'inherit' || v === 'unset' || v === 'initial') return true;
  if (/(%|vw|vh)$/.test(v)) return true;
  const n = parseFloat(v);
  if (Number.isNaN(n)) return false; // unparseable even after resolution — report, don't guess
  const px = /rem$/.test(v) ? n * 16 : n;
  return px <= 8 || px >= 999;
}
for (const { name, text } of css) {
  for (const m of text.matchAll(/border-radius:\s*([^;}]+)/g)) {
    for (const part of m[1].split(/\s+/)) {
      if (!radiusOk(part)) fail('radius-band', name, `border-radius: ${m[1].trim()}`);
    }
  }
}
for (const f of htmlFiles) {
  const text = readFileSync(f, 'utf8');
  for (const m of text.matchAll(/border-radius:\s*([^;"']+)/g)) {
    if (!radiusOk(m[1])) fail('radius-band', relative(DIST, f), `inline border-radius: ${m[1]}`);
  }
}

/* --- R4 no-atmosphere -------------------------------------------------- */
for (const { name, text } of css) {
  if (/blur\(/.test(text)) fail('no-atmosphere', name, 'blur() present');
  if (/radial-gradient\(/.test(text)) fail('no-atmosphere', name, 'radial-gradient() present');
}
for (const f of htmlFiles) {
  const text = readFileSync(f, 'utf8');
  if (/blur\(/.test(text)) fail('no-atmosphere', relative(DIST, f), 'inline blur()');
  if (/radial-gradient\(/.test(text)) fail('no-atmosphere', relative(DIST, f), 'inline radial-gradient()');
}

/* --- R5 hero-image ----------------------------------------------------- */
{
  const home = join(DIST, 'index.html');
  if (!existsSync(home)) {
    fail('hero-image', 'index.html', 'not built');
  } else {
    const text = readFileSync(home, 'utf8');
    const h1 = text.indexOf('</h1>');
    const before = h1 === -1 ? '' : text.slice(0, h1);
    if (!/<img|<picture/.test(before)) {
      fail('hero-image', 'index.html', 'no <img>/<picture> above the first </h1>');
    }
  }
}

/* --- R6 copy-formula --------------------------------------------------- */
const FORMULAS = [
  { id: 'we-verb-into', re: /\bWe\s+\w+\s+[\w\s]{0,40}?\binto\b/i },
  { id: 'tricolon', re: /\b(?:a|an|the)\s+\w+,\s+(?:a|an|the)\s+\w+,?\s+(?:and|or)\s+(?:a|an|the)\s+\w+/i },
];
for (const f of htmlFiles) {
  let text = readFileSync(f, 'utf8');
  text = text.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ');
  text = text.replace(/&mdash;/g, '—').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ');
  for (const { id, re } of FORMULAS) {
    const hit = text.match(re);
    if (hit) fail('copy-formula', relative(DIST, f), `${id}: "${hit[0].trim().slice(0, 70)}"`);
  }
}

/* --- R7 contrast ------------------------------------------------------- */
const srgb = (hex) => [1, 3, 5].map((i) => {
  const c = parseInt(hex.slice(i, i + 2), 16) / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
});
const lum = (hex) => { const [r, g, b] = srgb(hex); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const tokens = {};
for (const { text } of css) {
  for (const m of text.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    tokens[m[1]] = m[2].toLowerCase();
  }
}
// Text pairs need 4.5:1. Focus rings are non-text (WCAG 1.4.11) and need 3:1.
// Decorative hairline rules are exempt from any minimum and are not tested.
const PAIRS = [
  ['ink', 'paper', 4.5], ['muted', 'paper', 4.5],
  ['paper', 'ink', 4.5], ['muted-invert', 'ink', 4.5],
  ['accent', 'ink', 4.5], ['accent-ink', 'paper', 4.5],
  ['accent-ink', 'accent-wash', 4.5],
  ['accent-ink', 'paper', 3], ['accent', 'ink', 3],
];
for (const [fg, bg, min] of PAIRS) {
  if (!tokens[fg] || !tokens[bg]) { fail('contrast', 'global.css', `token missing: ${fg} or ${bg}`); continue; }
  const r = ratio(tokens[fg], tokens[bg]);
  if (r < min) fail('contrast', 'global.css', `${fg} on ${bg} = ${r.toFixed(2)}, need ${min}`);
}

/* --- report ------------------------------------------------------------ */
console.log(`HTML pages checked: ${htmlFiles.length}`);
console.log(`CSS files checked:  ${cssFiles.length}`);
const byRule = {};
for (const f of failures) (byRule[f.rule] ??= []).push(f);
const RULES = ['fonts-approved', 'display-scale', 'radius-band', 'no-atmosphere', 'hero-image', 'copy-formula', 'contrast'];
console.log('');
for (const r of RULES) {
  const hits = byRule[r] ?? [];
  console.log(`${hits.length ? 'FAIL' : ' ok '}  ${r}${hits.length ? ` (${hits.length})` : ''}`);
  for (const h of hits.slice(0, 8)) console.log(`        ${h.where}: ${h.detail}`);
  if (hits.length > 8) console.log(`        ... and ${hits.length - 8} more`);
}
console.log(`\nTOTAL VIOLATIONS: ${failures.length}`);
process.exit(failures.length ? 1 : 0);
