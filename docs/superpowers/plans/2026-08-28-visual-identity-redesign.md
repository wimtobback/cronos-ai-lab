# Visual Identity Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-art-direct cronos-ai-lab.be so it stops reading as AI-generated — new typefaces, palette, geometry, homepage narrative and copy voice — without regressing its accessibility, performance or link integrity.

**Architecture:** The redesign is delivered as an executable gate plus a token swap. `scripts/check-design.mjs` encodes the spec's seven principles as assertions against `dist/`; it fails on the current site and every task drives it greener. The palette and typeface migration exploits existing indirection — templates reference token *names* (`text-muted` ×39, `border-rule` ×22), and `global.css:13-15` maps fonts through `--ff-display/--ff-body/--ff-mono` — so changing hex values and font assignments touches one file and breaks zero templates. Structural work then replaces card grids with ruled lists, section by section.

**Tech Stack:** Astro 7.2.4 (static, `build.format: 'file'`, `base: '/cronos-ai-lab'`), Tailwind CSS v4 (`@theme` tokens), Astro font pipeline via `fontProviders.fontshare()`, `astro:assets` for images. No test runner in the repo — verification is `astro check`, `check:links`, and the new `check:design`.

**Spec:** `docs/superpowers/specs/2026-08-28-visual-identity-redesign-design.md`

## Global Constraints

- **Typefaces (exact, no others):** Cabinet Grotesk `700` (display), Switzer `400`/`500` (text), Azeret Mono `500` (mono). Four weights total.
- **Palette (exact hex):** `ink #101614`, `ink-raised #18201d`, `paper #f2f1ea`, `paper-raised #ffffff`, `muted #5f6560`, `muted-invert #9aa39c`, `rule #dedcd2`, `rule-invert #262e2a`, `accent #c8f751`, `accent-ink #41631a`, `accent-wash #eaf6cf`.
- **Radius:** `2px` surfaces, `999px` buttons, `50%` avatars. **Nothing between 8px and 999px.**
- **No decorative `blur()` or `radial-gradient()`.** Anywhere.
- **Display scale maximum ≥ 7.5rem.** Target `clamp(3.25rem, 1rem + 9vw, 8rem)`, line-height `0.92`, letter-spacing `-0.035em`.
- **Motion budget: one animated element per page.** Hover states change colour and rule weight only — never `translateY` + shadow.
- **Copy:** no "We [verb] X into Y" opening claim; no rhetorical tricolons; verb-first present tense; real numbers where they exist.
- **All internal links go through `withBase()`** (`src/lib/url.ts`). Raw `href="/about"` 404s in production.
- **Images must live in `src/assets/` and go through `astro:assets`.** Files in `public/` bypass the optimiser.
- **`blockSearchIndexing` stays `true`** (`src/config/site.ts`) until `PLACEHOLDER.md` is worked through. Do not flip it.
- **Every task ends green on:** `npm run check` (0 errors, 0 warnings, 0 hints) and `npm run build`.

---

## Prerequisite: branch

The repo is currently on `main` tracking `origin/main`. Do not commit redesign work to `main`.

```bash
git checkout -b redesign/visual-identity
```

---

## File Structure

**Created:**

| File | Responsibility |
|---|---|
| `scripts/check-design.mjs` | Executable form of the spec's principles. Single source of truth for "is this still AI-slop". |
| `src/components/RuledList.astro` | The list-row primitive that replaces `.card` in movements 3, 4, 5. |
| `src/components/Statement.astro` | Movement 1. Replaces `Hero.astro`. |
| `src/components/Standing.astro` | Movement 2. Logo strip. |
| `src/components/Close.astro` | Movement 6. |
| `src/assets/photography/` | Real images, processed by `astro:assets`. |

**Modified:**

| File | Change |
|---|---|
| `astro.config.mjs` | Font entries: four candidates → three approved, mapped to `--ff-display/body/mono`. |
| `src/styles/global.css` | Palette values, scale, radius, motion, grid, new primitives. Token *names* unchanged. |
| `src/pages/index.astro` | Rebuilt as six movements. |
| `src/components/{Nav,Footer,RequestForm,Reveal}.astro` | Geometry and motion conformance. |
| `src/pages/{startups,challenges,request-for-ai}/[slug].astro`, `about`, `contact`, `privacy`, `cookies`, `thank-you`, `404` | Conformance to new primitives. |
| `package.json` | `check:design` script. |

**Deleted at the end:**

| File | When |
|---|---|
| `src/pages/specimen.astro` | Task 17 |
| `src/components/Hero.astro` | Task 7 (superseded by `Statement.astro`) |
| `src/components/SectionHeader.astro` | Task 14, once no page imports it |
| Candidate font entries + sitemap exclusion in `astro.config.mjs` | Task 17 |

---

## Task 1: The design-principle gate

The spec's principles are written as tests precisely so they can be executed. This task builds that executor. It **must fail** against the current site — that failure is the baseline every later task reduces.

**Files:**
- Create: `scripts/check-design.mjs`
- Modify: `package.json` (scripts block)

**Interfaces:**
- Consumes: nothing.
- Produces: `npm run check:design` → exits `0` when clean, `1` with a rule-by-rule report otherwise. Rule ids later tasks reference: `fonts-approved`, `display-scale`, `radius-band`, `no-atmosphere`, `hero-image`, `copy-formula`, `contrast`.

- [ ] **Step 1: Write the checker**

Follows `scripts/check-links.mjs` conventions exactly — walks `dist/`, prints a report, `process.exit(1)` on failure.

```js
// scripts/check-design.mjs
// Executable form of docs/superpowers/specs/2026-08-28-visual-identity-redesign-design.md §3.
// Principle 5 ("every section earns its own shape") is not automatable and is a
// manual gate in the plan instead. Everything else is enforced here.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');

// The specimen is a throwaway comparison page that deliberately renders the
// old copy and three palettes. It is exempt until Task 17 deletes it.
const IGNORE = new Set(['specimen.html']);

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
function radiusOk(raw) {
  const v = raw.trim().toLowerCase();
  if (v === '0' || v === 'inherit' || v === 'unset' || v === 'initial') return true;
  if (/(%|vw|vh)$/.test(v)) return true;
  const n = parseFloat(v);
  if (Number.isNaN(n)) return true; // var() etc — not statically checkable
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
```

- [ ] **Step 2: Register the script**

In `package.json`, add to `scripts` after `check:links`:

```json
"check:design": "node scripts/check-design.mjs"
```

- [ ] **Step 3: Run it against the current site to confirm it fails**

```bash
npm run build && npm run check:design
```

Expected: exit code `1`. Specifically `FAIL fonts-approved` (Instrument Serif/Inter/JetBrains Mono plus four candidates declared), `FAIL display-scale` (max is `5.5rem`), `FAIL radius-band` (`0.75rem` = 12px from `.card`), `FAIL no-atmosphere` (the `Hero.astro` bloom), `FAIL hero-image` (no image on the homepage), `FAIL copy-formula` (`we-verb-into` on `/`).

If any of those report `ok`, the checker is wrong — fix the checker before proceeding. A gate that passes a site we know violates the spec is worse than no gate.

- [ ] **Step 4: Commit**

```bash
git add scripts/check-design.mjs package.json
git commit -m "test: add executable design-principle gate

Encodes spec §3 principles 1,2,3,4,6,7 as assertions over dist/.
Principle 5 is not automatable and stays a manual review gate.
Fails against the current site by design."
```

---

## Task 2: Typefaces and palette

The migration exploits existing indirection: `global.css:13-15` maps `--font-display/body/mono` to `--ff-display/--ff-body/--ff-mono`, and templates reference colour token *names* ~140 times. Assigning the new faces to the same CSS variables and changing only hex values means no template changes.

**Files:**
- Modify: `astro.config.mjs` (fonts array)
- Modify: `src/styles/global.css:11-70` (`@theme` block)

**Interfaces:**
- Consumes: `check:design` rule ids from Task 1.
- Produces: `--ff-display` = Cabinet Grotesk 700, `--ff-body` = Switzer 400/500, `--ff-mono` = Azeret Mono 500. Colour token names unchanged: `paper`, `paper-raised`, `ink`, `ink-raised`, `muted`, `muted-invert`, `rule`, `rule-invert`, `accent`, `accent-ink`, `accent-wash`.

- [ ] **Step 1: Replace the fonts array**

In `astro.config.mjs`, replace the entire `fonts: [...]` array — both the four throwaway candidates and the three current faces — with exactly this. Note the `cssVariable` names are deliberately the *old* ones.

```js
  // Self-hosted, subsetted, preloaded. No third-party font request at runtime.
  // cssVariable names are intentionally unchanged from the previous system so
  // src/styles/global.css and every template keep working untouched.
  fonts: [
    {
      provider: fontProviders.fontshare(),
      name: 'Cabinet Grotesk',
      cssVariable: '--ff-display',
      weights: [700],
      fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
    },
    {
      provider: fontProviders.fontshare(),
      name: 'Switzer',
      cssVariable: '--ff-body',
      weights: [400, 500],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontshare(),
      name: 'Azeret Mono',
      cssVariable: '--ff-mono',
      weights: [500],
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'monospace'],
    },
  ],
```

**This breaks `/specimen`**, which references `--ff-cabinet`/`--ff-technor`/`--ff-switzer`/`--ff-azeret`. That is expected and acceptable — its job (choosing the face) is done. Task 17 deletes it. If you want it readable in the meantime, leave it; it will fall back to system fonts.

- [ ] **Step 2: Replace the palette and scale in the `@theme` block**

In `src/styles/global.css`, replace the palette and type-scale sections (currently lines ~17-70) with:

```css
  /* --- Palette: paper (light) ------------------------------------------ */
  --color-paper: #f2f1ea;        /* page ground — chalk */
  --color-paper-raised: #ffffff; /* surfaces sitting on paper */
  --color-ink: #101614;          /* primary text + inverted section ground */
  --color-muted: #5f6560;        /* secondary text on paper */
  --color-rule: #dedcd2;         /* hairline borders on paper */

  /* --- Palette: ink (inverted sections) -------------------------------- */
  --color-ink-raised: #18201d;
  --color-muted-invert: #9aa39c;
  --color-rule-invert: #262e2a;

  /* --- Accent ---------------------------------------------------------- *
   * Acid on a desaturated forest ground. A saturated accent over a quiet
   * ground is also what lets photography supply the page's colour.
   * Measured: accent on ink 14.72:1, accent-ink on paper 6.13:1.          */
  --color-accent: #c8f751;
  --color-accent-ink: #41631a;
  --color-accent-wash: #eaf6cf;

  /* --- Fluid type scale ------------------------------------------------ */
  --text-display: clamp(3.25rem, 1rem + 9vw, 8rem);
  --text-display--line-height: 0.92;
  --text-display--letter-spacing: -0.035em;

  --text-h1: clamp(2.75rem, 1.7rem + 3.6vw, 5rem);
  --text-h1--line-height: 0.98;
  --text-h1--letter-spacing: -0.03em;

  --text-h2: clamp(2rem, 1.4rem + 2.6vw, 3.5rem);
  --text-h2--line-height: 1.04;
  --text-h2--letter-spacing: -0.025em;

  --text-h3: clamp(1.375rem, 1.2rem + 0.6vw, 1.75rem);
  --text-h3--line-height: 1.15;
  --text-h3--letter-spacing: -0.015em;

  --text-lead: clamp(1.125rem, 1.03rem + 0.42vw, 1.375rem);
  --text-lead--line-height: 1.5;

  --text-body: 1.0625rem;
  --text-body--line-height: 1.65;

  --text-meta: 0.6875rem;
  --text-meta--line-height: 1.4;
  --text-meta--letter-spacing: 0.14em;
```

- [ ] **Step 3: Remove the `--color-accent-invert` token**

The old palette carried `--color-accent-invert: #8798ff` because `#2c4bff` sat at ~2.5:1 on ink. Acid green measures **14.72:1** on ink, so the lifted variant is dead weight. Delete the declaration, then find and replace its two usages:

```bash
grep -rn "accent-invert" src/
```

Replace each with `accent`. (`src/components/RequestCard.astro` is one; that component is rewritten in Task 11 regardless.)

- [ ] **Step 4: Verify fonts resolved and contrast passes**

```bash
npm run build
grep -oE '\-\-ff-(display|body|mono):[^;]*' dist/_astro/*.css | head -3
npm run check:design
```

Expected: the three variables resolve to hashed `Cabinet Grotesk-…`, `Switzer-…`, `Azeret Mono-…` families (not bare fallbacks). `check:design` now reports `ok fonts-approved`, `ok display-scale`, `ok contrast`. Still failing: `radius-band`, `no-atmosphere`, `hero-image`, `copy-formula`.

- [ ] **Step 5: Confirm no template regressed**

```bash
npm run check && npm run check:links
```

Expected: `0 errors, 0 warnings, 0 hints`; `BROKEN: 0`.

- [ ] **Step 6: Commit**

```bash
git add astro.config.mjs src/styles/global.css src/components/RequestCard.astro
git commit -m "feat: forest-black/acid palette and Cabinet Grotesk/Switzer/Azeret

Keeps --ff-* variable names and colour token names so no template
changes. Drops --color-accent-invert: acid measures 14.72:1 on ink,
so the lifted variant is unnecessary."
```

---

## Task 3: Geometry — radius, grid, bleed

**Files:**
- Modify: `src/styles/global.css` (`@layer components`)

**Interfaces:**
- Produces: `.shell` (12-column grid), `.bleed` (full-width escape), `.rule-col` (structural divider). `.card` radius drops to `2px`; hover lift and shadow removed.

- [ ] **Step 1: Replace `.shell` with a 12-column grid**

```css
  /* --- Page container ---------------------------------------------------
   * A real 12-column grid, so sections can run 7/5 or 8/4 with deliberate
   * offsets. Principle 5 ("every section earns its own shape") is not
   * achievable while every section is an equal-column card row.          */
  .shell {
    width: 100%;
    max-width: 80rem;
    margin-inline: auto;
    padding-inline: var(--spacing-gutter);
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    column-gap: var(--spacing-gutter);
  }
  @media (width >= 48rem) {
    .shell {
      padding-inline: 3rem;
      grid-template-columns: repeat(12, minmax(0, 1fr));
    }
  }
  /* Default: children span the full grid unless a section opts out. */
  .shell > * { grid-column: 1 / -1; }

  /* --- Full-bleed escape ------------------------------------------------ */
  .bleed {
    width: 100vw;
    max-width: 100vw;
    margin-left: 50%;
    transform: translateX(-50%);
  }

  /* --- Structural column divider ---------------------------------------- *
   * Hairlines stop being section separators and become the thing that makes
   * a layout look drawn rather than stacked.                              */
  .rule-col { border-left: 1px solid var(--color-rule); }
  .on-ink .rule-col { border-left-color: var(--color-rule-invert); }
```

- [ ] **Step 2: Harden the geometry on `.card` and `.btn`**

Replace the `.card` block and its motion rules:

```css
  /* --- Surface ----------------------------------------------------------
   * 2px. No hover lift, no shadow — that combination is the single most
   * copied card treatment on the web.                                    */
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    background-color: var(--color-paper-raised);
    border: 1px solid var(--color-rule);
    border-radius: 2px;
    transition: border-color 180ms var(--ease-out-soft),
                background-color 180ms var(--ease-out-soft);
  }
  .on-ink .card {
    background-color: var(--color-ink-raised);
    border-color: var(--color-rule-invert);
  }
  .card-interactive:hover { border-color: var(--color-ink); }
  .on-ink .card-interactive:hover { border-color: var(--color-accent); }
```

Delete both `@media (prefers-reduced-motion: ...)` blocks that wrap `.card-interactive` — with no transform there is nothing motion-sensitive left to guard.

- [ ] **Step 3: Verify the radius band is clean**

```bash
npm run build && npm run check:design
```

Expected: `ok radius-band`. If it still fails, the report names the file and value — `.field-select` and `.eyebrow` may carry stale radii, and `:focus-visible` in `@layer base` sets `border-radius: 2px` (already compliant).

- [ ] **Step 4: Check nothing overflows**

The `.shell` change from flow layout to grid is the highest-regression-risk edit in this plan. Load `/`, `/startups`, `/challenges`, `/about`, `/contact` at 375px, 768px and 1440px and confirm no horizontal scrollbar and no collapsed columns.

```bash
npm run dev
```

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: 12-column grid, bleed escape, 2px surfaces

Removes card hover lift and shadow. Hairlines become structural
column dividers rather than section separators."
```

---

## Task 4: Motion budget

**Files:**
- Modify: `src/pages/index.astro`, `src/components/Reveal.astro`
- Modify: `src/styles/global.css` (motion block at end of file)

**Interfaces:**
- Consumes: `.js-reveal [data-reveal]` from the existing guard.
- Produces: `Reveal` still exists and still guards correctly, but is used at most once per page.

- [ ] **Step 1: Strip the staggered reveals from the homepage**

In `src/pages/index.astro`, remove every `<Reveal>` wrapper and every `delay={i * 60}`. The homepage is rebuilt in Tasks 7-12 anyway; this removes the pattern now so `check:design` and review are not reading around it.

Keep the `Reveal.astro` component and the `BaseLayout.astro` inline guard. The guard architecture — support check, reduced-motion gate, 2.5s failsafe — is well built and stays; it simply has less to do.

- [ ] **Step 2: Reduce the reveal distance**

In `src/styles/global.css`, in the `.js-reveal [data-reveal]` rule, change `translateY(12px)` to `translateY(6px)` and the transition from `500ms` to `380ms`. One element moving a short distance reads as intent; twenty elements moving 12px reads as a template.

- [ ] **Step 3: Verify the failsafe still works**

```bash
npm run build && npm run preview
```

In DevTools, set "Emulate CSS prefers-reduced-motion: reduce" and reload. Expected: all content visible immediately, no transition. Then re-enable motion and confirm content is still visible with JS disabled.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/styles/global.css
git commit -m "refactor: cut staggered reveals, keep the guard

Motion budget is one element per page. The IntersectionObserver
guard and reduced-motion failsafe are unchanged."
```

---

## Task 5: The ruled-list primitive

The structural core of the redesign. A hairline-ruled list is a strong anti-generated signal precisely because a card grid is what every generator reaches for — and eight one-line taglines do not need eight bordered boxes.

**Files:**
- Create: `src/components/RuledList.astro`
- Modify: `src/styles/global.css` (`@layer components`)

**Interfaces:**
- Produces: `<RuledList>` wrapping `<RuledList.Row>`-shaped children. Because Astro has no compound components, this ships as **two** components: `RuledList.astro` (the `<ul>`) and `RuledRow.astro` (the `<li>`).

- [ ] **Step 1: Create the list container**

```astro
---
// src/components/RuledList.astro
// Replaces card grids in movements 3, 4 and 5. Rows are separated by a single
// hairline, not boxed individually.
interface Props {
  class?: string;
  /** Renders a leading rule above the first row. */
  capped?: boolean;
}
const { class: className, capped = true } = Astro.props;
---

<ul class:list={['ruled-list', capped && 'is-capped', className]}>
  <slot />
</ul>
```

- [ ] **Step 2: Create the row**

```astro
---
// src/components/RuledRow.astro
import { withBase } from '../lib/url';

interface Props {
  /** Mono label, upper-left. Typically an index number or sector. */
  index?: string;
  title: string;
  summary?: string;
  /** Right-hand metadata, small and muted. */
  meta?: string;
  href?: string;
  /** Larger type for a lead row. */
  lead?: boolean;
}
const { index, title, summary, meta, href, lead = false } = Astro.props;
---

<li class:list={['ruled-row', lead && 'is-lead']}>
  {index && <p class="eyebrow ruled-row-index">{index}</p>}

  <div class="ruled-row-body">
    <h3 class:list={[lead ? 'text-h2' : 'text-h3', 'ruled-row-title']}>
      {href ? <a href={withBase(href)} class="ruled-row-link">{title}</a> : title}
    </h3>
    {summary && <p class="ruled-row-summary">{summary}</p>}
  </div>

  {meta && <p class="ruled-row-meta">{meta}</p>}
</li>
```

- [ ] **Step 3: Style it**

Add to `@layer components` in `src/styles/global.css`:

```css
  /* --- Ruled list --------------------------------------------------------
   * The card grid's replacement. One hairline between rows; the row itself
   * has no border, no radius and no background.                           */
  .ruled-list { display: block; }
  .ruled-list.is-capped { border-top: 1px solid var(--color-rule); }
  .on-ink .ruled-list.is-capped { border-top-color: var(--color-rule-invert); }

  .ruled-row {
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem 1.5rem;
    padding-block: 1.75rem;
    border-bottom: 1px solid var(--color-rule);
    transition: background-color 160ms var(--ease-out-soft);
  }
  .on-ink .ruled-row { border-bottom-color: var(--color-rule-invert); }

  @media (width >= 48rem) {
    .ruled-row {
      grid-template-columns: 6rem minmax(0, 1fr) auto;
      align-items: baseline;
      padding-block: 2.25rem;
    }
    .ruled-row.is-lead { padding-block: 3.5rem; }
  }

  .ruled-row-index { align-self: start; }
  .ruled-row-title { text-wrap: balance; }
  .ruled-row-summary {
    margin-top: 0.625rem;
    max-width: 44ch;
    color: var(--color-muted);
    font-size: 0.9375rem;
    line-height: 1.6;
  }
  .on-ink .ruled-row-summary { color: var(--color-muted-invert); }
  .ruled-row-meta {
    font-family: var(--font-mono);
    font-size: var(--text-meta);
    letter-spacing: var(--text-meta--letter-spacing);
    text-transform: uppercase;
    color: var(--color-muted);
    white-space: nowrap;
  }
  .on-ink .ruled-row-meta { color: var(--color-muted-invert); }

  /* Whole row clickable, link text stays the accessible name. */
  .ruled-row-link { text-decoration: none; color: inherit; }
  .ruled-row-link::after { content: ""; position: absolute; inset: 0; }
  .ruled-row:hover { background-color: color-mix(in srgb, var(--color-accent) 8%, transparent); }
```

- [ ] **Step 4: Verify in isolation**

Temporarily render a `RuledList` with three `RuledRow`s on `/challenges`, run the site, confirm rows align, hover tints, and the whole row is clickable with the title as accessible name (check with keyboard tab order).

```bash
npm run dev
npm run check
```

Expected: `0 errors, 0 warnings, 0 hints`.

- [ ] **Step 5: Commit**

```bash
git add src/components/RuledList.astro src/components/RuledRow.astro src/styles/global.css
git commit -m "feat: ruled-list primitive replacing card grids"
```

---

## Task 6: Nav and Footer conformance

**Files:**
- Modify: `src/components/Nav.astro`, `src/components/Footer.astro`, `src/components/Logo.astro`

**Interfaces:**
- Consumes: tokens from Task 2, geometry from Task 3.
- Produces: no interface change — `Nav` and `Footer` keep their current props.

- [ ] **Step 1: Audit for stale geometry**

```bash
grep -n "rounded\|radius\|shadow\|blur\|gradient" src/components/Nav.astro src/components/Footer.astro src/components/Logo.astro
```

Replace every `rounded-lg`/`rounded-xl`/`rounded-md` with `rounded-[2px]`, and every `rounded-full` stays. Remove any `shadow-*`.

- [ ] **Step 2: Keep the dropdown behaviour intact**

Do **not** touch the `<details>` dismissal JavaScript in `Nav.astro` (outside click, Escape, tabbing out) or the mobile `<details>` menu. Those are correct and unrelated to art direction. Change only classes.

- [ ] **Step 3: Verify keyboard behaviour survived**

```bash
npm run dev
```

Tab to the Request for AI dropdown, open with Enter, confirm Escape closes it and tabbing out closes it. Confirm the mobile menu opens with JS disabled.

- [ ] **Step 4: Commit**

```bash
git add src/components/Nav.astro src/components/Footer.astro src/components/Logo.astro
git commit -m "style: conform nav, footer and logo to new geometry"
```

---

## Task 7: Movement 1 — Statement

Replaces `Hero.astro`. Kills the bloom, the three fabricated stats, and the "We turn X into Y" headline in one change.

**Files:**
- Create: `src/components/Statement.astro`
- Create: `src/assets/photography/statement.jpg` (placeholder, 16:9, see step 1)
- Delete: `src/components/Hero.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: `<Statement />`, no props. Consumes `src/assets/photography/statement.jpg` via `astro:assets`.

- [ ] **Step 1: Add a shot-accurate placeholder**

Until the shoot delivers, generate a real **16:9, 2400×1350** neutral JPEG so layout, `widths`, and the LCP budget are exercised realistically. A 1×1 stub will not work — Astro cannot generate 2400px variants from it.

`sharp` is already present as an `astro:assets` dependency and is importable as ESM (the project is `"type": "module"`, so `require` is unavailable — use `import`).

```bash
mkdir -p src/assets/photography
node --input-type=module -e "
import sharp from 'sharp';
// Neutral mid-grey at the real hero dimensions. Replaced in Task 16.
// Deliberately not stock imagery: a stock placeholder gets forgotten and shipped.
await sharp({ create: { width: 2400, height: 1350, channels: 3, background: { r: 42, g: 48, b: 45 } } })
  .jpeg({ quality: 82 })
  .toFile('src/assets/photography/statement.jpg');
console.log('placeholder written');
"
```

- [ ] **Step 2: Write the component**

```astro
---
// src/components/Statement.astro
// Movement 1. Full-bleed photograph, one line at display scale, one CTA.
// No stats grid: PLACEHOLDER.md records those numbers as fabricated, and
// putting fabricated figures above the fold is a launch risk regardless of
// how they look.
import { Image } from 'astro:assets';
import { withBase } from '../lib/url';
import statementImage from '../assets/photography/statement.jpg';
---

<section class="on-ink statement" aria-labelledby="statement-heading">
  <div class="statement-media bleed">
    <Image
      src={statementImage}
      alt=""
      widths={[768, 1280, 1920, 2400]}
      sizes="100vw"
      formats={['avif', 'webp']}
      loading="eager"
      fetchpriority="high"
      class="statement-img"
    />
  </div>

  <div class="shell statement-body">
    <div class="statement-copy">
      <p class="eyebrow">Kontich &middot; part of The Cronos Group</p>

      <h1 id="statement-heading" class="mt-6 text-display">
        Ninety days to a verdict.
      </h1>

      <p class="mt-8 max-w-xl text-lead text-muted-invert">
        Bring us an operational problem. We build against it for ninety days
        and tell you what we found, including when the answer is no.
      </p>

      <div class="mt-10">
        <a href={withBase('/request-for-ai/challenges')} class="btn btn-primary">
          Bring us a challenge
        </a>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Style it**

Add to `@layer components`:

```css
  /* --- Movement 1: Statement --------------------------------------------
   * The photograph is the ground; type sits in its lower third. A scrim is
   * deliberately avoided — the shoot brief asks for a quiet region instead,
   * because a gradient scrim is itself a generated-looking device.        */
  .statement { position: relative; overflow: hidden; }
  .statement-media { position: absolute; inset: 0; z-index: 0; }
  .statement-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 40%;
  }
  .statement-body {
    position: relative;
    z-index: 1;
    padding-block: clamp(6rem, 4rem + 12vw, 14rem);
  }
  @media (width >= 48rem) {
    .statement-copy { grid-column: 1 / span 8; }
  }
```

Note `.statement-copy` uses `grid-column` — this is the first consumer of the Task 3 grid.

- [ ] **Step 4: Wire it in and delete the old hero**

In `src/pages/index.astro` replace `import Hero from '../components/Hero.astro';` with `import Statement from '../components/Statement.astro';` and `<Hero />` with `<Statement />`.

```bash
git rm src/components/Hero.astro
```

- [ ] **Step 5: Verify the gate advanced**

```bash
npm run build && npm run check:design
```

Expected: `ok no-atmosphere` (the bloom is gone with `Hero.astro`), `ok hero-image` (an `<img>` now precedes the first `</h1>`), and `copy-formula` no longer reports `we-verb-into` on `/`.

- [ ] **Step 6: Check the LCP budget**

This is the risk recorded in spec §9. Confirm the emitted hero image is within budget:

```bash
ls -la dist/_astro/statement*.avif | awk '{print $5, $9}'
```

Expected: largest AVIF **under 200KB**. If over, reduce `widths` or raise compression before proceeding — this is the main threat to the Performance 98.

- [ ] **Step 7: Commit**

```bash
git add -A src/components src/assets src/pages/index.astro src/styles/global.css
git commit -m "feat: movement 1 statement, replacing hero

Removes the radial-gradient bloom, the three fabricated stats and the
'We turn X into Y' headline. First consumer of the 12-column grid."
```

---

## Task 8: Movement 2 — Standing

**Files:**
- Create: `src/components/Standing.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `getCollection('startups')`.
- Produces: `<Standing />`, no props.

- [ ] **Step 1: Write the component**

```astro
---
// src/components/Standing.astro
// Movement 2. A dense horizontal strip: where the Cronos Group relationship
// belongs — as context for credibility, not as a hero trophy.
import { getCollection } from 'astro:content';
import { withBase } from '../lib/url';

const startups = (await getCollection('startups', ({ data }) => !data.draft)).sort(
  (a, b) => a.data.name.localeCompare(b.data.name),
);
---

<section class="shell standing" aria-label="Standing">
  <p class="standing-line">
    <span class="eyebrow">Built inside The Cronos Group</span>
    <span class="standing-detail">
      6,000 engineers across 600 companies. The Lab is the venture arm.
    </span>
  </p>

  <ul class="standing-logos">
    {
      startups.map((s) => (
        <li class="standing-logo">
          <img
            src={withBase(s.data.logo)}
            alt={s.data.name}
            width="28"
            height="28"
            loading="lazy"
            decoding="async"
          />
          <span>{s.data.name}</span>
        </li>
      ))
    }
  </ul>
</section>
```

- [ ] **Step 2: Style it**

```css
  /* --- Movement 2: Standing ---------------------------------------------- */
  .standing { padding-block: 2.5rem; border-bottom: 1px solid var(--color-rule); }
  .standing-line {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.5rem 1rem;
  }
  @media (width >= 48rem) { .standing-line { grid-column: 1 / span 5; } }
  .standing-detail { font-size: 0.9375rem; color: var(--color-muted); }
  .standing-logos {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.75rem;
    margin-top: 1.5rem;
  }
  @media (width >= 48rem) {
    .standing-logos { grid-column: 6 / -1; margin-top: 0; justify-content: flex-end; }
  }
  .standing-logo {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: var(--color-muted);
  }
  .standing-logo img { border-radius: 2px; }
```

- [ ] **Step 3: Verify**

```bash
npm run build && npm run check:design && npm run check:links
```

Expected: no new violations; `BROKEN: 0`.

> **Manual gate (principle 5):** movement 2 must not repeat movement 1's shape. Confirm visually that it reads as a dense horizontal strip, not a second hero.

- [ ] **Step 4: Commit**

```bash
git add src/components/Standing.astro src/pages/index.astro src/styles/global.css
git commit -m "feat: movement 2 standing strip"
```

---

## Task 9: Movement 3 — The work

Moved ahead of the portfolio. The site currently shows outputs before establishing the input, and this also puts its strongest copy at the top of the page.

**Files:**
- Modify: `src/pages/index.astro`
- Uses: `RuledList.astro`, `RuledRow.astro` from Task 5

- [ ] **Step 1: Build the section**

Asymmetric 7/5: one challenge told at length, the rest as a ruled list.

```astro
{/* ===== Movement 3: The work ======================================== */}
<section class="shell work" aria-labelledby="work-heading">
  <div class="work-intro">
    <p class="eyebrow">Customer challenges</p>
    <h2 id="work-heading" class="mt-4 text-h2">Problems we were asked to solve</h2>
  </div>

  <div class="work-lead">
    <p class="eyebrow">{lead.data.sector} &middot; {lead.data.year}</p>
    <h3 class="mt-4 text-h1">
      <a href={withBase(`/challenges/${lead.id}`)}>{lead.data.title}</a>
    </h3>
    <p class="mt-6 max-w-xl text-lead text-muted">{lead.data.summary}</p>
    {lead.data.outcome && <p class="mt-6 eyebrow text-accent-ink">{lead.data.outcome}</p>}
  </div>

  <div class="work-rest">
    <RuledList>
      {
        rest.map((c) => (
          <RuledRow
            index={String(c.data.year)}
            title={c.data.title}
            meta={c.data.sector}
            href={`/challenges/${c.id}`}
          />
        ))
      }
    </RuledList>
  </div>
</section>
```

With this in the frontmatter of `src/pages/index.astro`:

```ts
const allChallenges = (await getCollection('challenges', ({ data }) => !data.draft)).sort(
  (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
);
const [lead, ...rest] = allChallenges.slice(0, 5);
```

- [ ] **Step 2: Style the 7/5 split**

```css
  /* --- Movement 3: The work ---------------------------------------------- */
  .work { padding-block: clamp(4rem, 3rem + 6vw, 8rem); row-gap: 3rem; }
  @media (width >= 62rem) {
    .work-intro { grid-column: 1 / -1; }
    .work-lead  { grid-column: 1 / span 7; }
    .work-rest  { grid-column: 8 / -1; padding-left: 2.5rem; border-left: 1px solid var(--color-rule); }
  }
```

- [ ] **Step 3: Verify**

```bash
npm run build && npm run check:design && npm run check:links && npm run check
```

> **Manual gate (principle 5):** movement 3 is a 7/5 asymmetric split with a structural column rule. It must not read as the equal-column grid it replaced.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/styles/global.css
git commit -m "feat: movement 3, challenges as 7/5 split ahead of portfolio"
```

---

## Task 10: Movement 4 — The companies

**Files:**
- Modify: `src/pages/index.astro`, `src/styles/global.css`

**Blocked by a content risk:** `PLACEHOLDER.md §51` records `public/logos/*.svg` as generated monograms. A ruled list exposes weak marks far more than a card grid hides them. If real marks are not available, ship this movement **logo-free** (name + tagline + sector only) and add logos in Task 16.

- [ ] **Step 1: Build the section**

```astro
{/* ===== Movement 4: The companies =================================== */}
<section class="shell companies" aria-labelledby="companies-heading">
  <div class="companies-intro">
    <p class="eyebrow">Portfolio</p>
    <h2 id="companies-heading" class="mt-4 text-h2">The companies</h2>
  </div>

  <div class="companies-list">
    <RuledList>
      {
        startups.map((s) => (
          <RuledRow
            title={s.data.name}
            summary={s.data.tagline}
            meta={`${s.data.stage} · ${s.data.cohort}`}
            href={`/startups/${s.id}`}
          />
        ))
      }
    </RuledList>
  </div>
</section>
```

- [ ] **Step 2: Style**

```css
  /* --- Movement 4: The companies ----------------------------------------- */
  .companies { padding-block: clamp(4rem, 3rem + 6vw, 8rem); row-gap: 2.5rem; }
  @media (width >= 62rem) {
    .companies-intro { grid-column: 1 / span 3; position: sticky; top: 7rem; align-self: start; }
    .companies-list  { grid-column: 4 / -1; }
  }
```

The sticky intro is movement 4's distinct shape — it is neither movement 3's split nor movement 2's strip.

- [ ] **Step 3: Verify**

```bash
npm run build && npm run check:design && npm run check:links
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/styles/global.css
git commit -m "feat: movement 4, portfolio as ruled list with sticky intro"
```

---

## Task 11: Movement 5 — Request for AI index

The conversion surface. Numbered `01`–`05`, large type, hairline rows. Kills the icon-in-a-circle.

**Files:**
- Modify: `src/pages/index.astro`, `src/styles/global.css`
- Delete: `src/components/RequestCard.astro`

- [ ] **Step 1: Build the section**

```astro
{/* ===== Movement 5: Request for AI ================================== */}
<section class="on-ink" id="request-for-ai" aria-labelledby="request-heading">
  <div class="shell requests">
    <div class="requests-intro">
      <p class="eyebrow">Request for AI</p>
      <h2 id="request-heading" class="mt-4 text-h2">Five ways in.</h2>
    </div>

    <div class="requests-list">
      <RuledList>
        {
          requests.map((r, i) => (
            <RuledRow
              lead
              index={String(i + 1).padStart(2, '0')}
              title={r.data.shortTitle}
              summary={r.data.summary}
              href={`/request-for-ai/${r.id}`}
            />
          ))
        }
      </RuledList>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Style**

```css
  /* --- Movement 5: Request for AI ---------------------------------------- */
  .requests { padding-block: clamp(5rem, 3.5rem + 8vw, 10rem); row-gap: 3rem; }
  @media (width >= 62rem) {
    .requests-intro { grid-column: 1 / -1; }
    .requests-list  { grid-column: 1 / -1; }
  }
  .requests .ruled-row-title { font-size: var(--text-h2); }
```

- [ ] **Step 3: Delete the card component**

```bash
git rm src/components/RequestCard.astro
grep -rn "RequestCard" src/ || echo "no remaining references"
```

Expected: no remaining references.

- [ ] **Step 4: Verify accessible names survived**

The old `RequestCard` used a `sr-only` full title with an `aria-hidden` short title. `RuledRow` renders `shortTitle` as the visible and accessible name. Confirm the five links read sensibly in a screen-reader list — if "Founders" alone is too thin, pass `title={r.data.title}` instead.

```bash
npm run build && npm run check:design && npm run check:links && npm run check
```

- [ ] **Step 5: Commit**

```bash
git add -A src/pages/index.astro src/components src/styles/global.css
git commit -m "feat: movement 5, request-for-ai as numbered index

Removes RequestCard and the icon-in-a-circle treatment."
```

---

## Task 12: Movement 6 — Close

**Files:**
- Create: `src/components/Close.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Write it**

```astro
---
// src/components/Close.astro
// Movement 6. Short by design — the page has said what it needs to.
import { withBase } from '../lib/url';
import { contact } from '../config/site';
---

<section class="shell close" aria-labelledby="close-heading">
  <h2 id="close-heading" class="text-h2 close-heading">
    Ninety days. Then an honest answer.
  </h2>
  <p class="close-contact">
    <a href={`mailto:${contact.general}`} class="close-mail">{contact.general}</a>
    <span class="eyebrow close-where">Veldkant 33A &middot; 2550 Kontich</span>
  </p>
</section>
```

- [ ] **Step 2: Style**

```css
  /* --- Movement 6: Close -------------------------------------------------- */
  .close { padding-block: clamp(4rem, 3rem + 6vw, 8rem); row-gap: 2rem; border-top: 1px solid var(--color-rule); }
  @media (width >= 48rem) {
    .close-heading { grid-column: 1 / span 7; }
    .close-contact { grid-column: 8 / -1; align-self: end; text-align: right; }
  }
  .close-mail {
    display: block;
    font-family: var(--font-display);
    font-size: var(--text-h3);
    color: var(--color-accent-ink);
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
  .close-where { display: block; margin-top: 0.75rem; }
```

- [ ] **Step 3: Full homepage review**

```bash
npm run build && npm run check:design && npm run check:links && npm run check
```

> **Manual gate (principle 5) — the whole point of the redesign.** Load `/` and confirm the six movements read as six shapes: full-bleed photograph, dense horizontal strip, 7/5 asymmetric split, sticky-intro list, numbered large-type index, two-column close. **No two consecutive sections may share a grid pattern.** If any two look alike, fix before committing.

- [ ] **Step 4: Commit**

```bash
git add src/components/Close.astro src/pages/index.astro src/styles/global.css
git commit -m "feat: movement 6 close, completing the homepage narrative"
```

---

## Task 13: Detail page templates

**Files:**
- Modify: `src/pages/startups/[slug].astro`, `src/pages/challenges/[slug].astro`, `src/pages/request-for-ai/[slug].astro`, `src/pages/startups/index.astro`, `src/pages/challenges/index.astro`, `src/pages/request-for-ai/index.astro`
- Modify: `src/components/{StartupCard,ChallengeCard,RequestForm}.astro`

- [ ] **Step 1: Convert the index pages to ruled lists**

`/startups` and `/challenges` currently render card grids. Replace with `RuledList`/`RuledRow`, matching movements 4 and 3 respectively. Then:

```bash
grep -rn "StartupCard\|ChallengeCard" src/
```

If no references remain, `git rm` both components. If the detail pages use them for "related" sections, keep them but conform their geometry (2px, no lift, no shadow).

- [ ] **Step 2: Conform the form**

```bash
grep -n "rounded\|shadow\|blur" src/components/RequestForm.astro
```

Replace radii with `rounded-[2px]`, keep `.btn` pills, remove shadows. **Do not change** the disabled/"not connected yet" state or the mailto fallback — that behaviour is deliberate and documented in `PLACEHOLDER.md`.

- [ ] **Step 3: Conform prose**

In `src/styles/global.css`, the `.prose h3` rule sets `font-family: var(--font-body)`. With Switzer at 500 this still reads correctly — verify on a challenge detail page that the h2/h3 hierarchy is legible now that h2 uses Cabinet Grotesk.

- [ ] **Step 4: Verify every route**

```bash
npm run build && npm run check:design && npm run check:links && npm run check
```

Expected: `BROKEN: 0` across all pages, `0 errors, 0 warnings, 0 hints`.

- [ ] **Step 5: Commit**

```bash
git add -A src/pages src/components src/styles/global.css
git commit -m "feat: convert index and detail pages to ruled lists"
```

---

## Task 14: Static pages and `SectionHeader` removal

**Files:**
- Modify: `src/pages/{about,contact,privacy,cookies,thank-you,404}.astro`, `src/layouts/ProseLayout.astro`
- Delete: `src/components/SectionHeader.astro`

- [ ] **Step 1: Conform each page**

Work through the six pages. For each: replace stale radii, remove shadows, confirm `.shell` grid children span correctly, confirm headings use the new scale.

- [ ] **Step 2: Remove `SectionHeader`**

```bash
grep -rn "SectionHeader" src/
```

Every remaining usage must be replaced with an inline intro block (as movements 3-5 do). `SectionHeader` existing at all is what made every section share a shape — that is why it goes rather than being restyled. Then:

```bash
git rm src/components/SectionHeader.astro
grep -rn "SectionHeader" src/ || echo "clean"
```

- [ ] **Step 3: Verify**

```bash
npm run build && npm run check && npm run check:links && npm run check:design
```

- [ ] **Step 4: Responsive sweep**

At 375, 768 and 1440 across `/`, `/startups`, `/startups/sondr`, `/challenges`, `/challenges/incident-triage-telecom`, `/request-for-ai`, `/request-for-ai/challenges`, `/about`, `/contact`, `/404`: no horizontal overflow, no collapsed grid columns, no clipped display type.

- [ ] **Step 5: Commit**

```bash
git add -A src/pages src/components src/layouts
git commit -m "feat: conform static pages, remove SectionHeader

SectionHeader is deleted rather than restyled: a shared section
component is what made every section the same shape."
```

---

## Task 15: Copy pass

**Files:**
- Modify: `src/config/site.ts`, `src/content/requests/*.md`, `src/content/challenges/*.md`, `src/content/startups/*.md`, homepage strings

**Interfaces:**
- Consumes: `copy-formula` rule from Task 1.
- Produces: no code interface change.

- [ ] **Step 1: Fix the two highest-visibility violations**

Both are recorded in spec §6.

`src/config/site.ts:10` — `tagline: 'Where AI ambition becomes a company.'` uses an abstract noun as subject. Replace with something verb-first and concrete, e.g. `'Ninety days from problem to verdict.'`

Any remaining "a problem, a company, a career move or a team to train — there is a front door for it" construction: delete the tricolon and the drumroll dash. State the five offerings as five things, which movement 5 already does structurally.

- [ ] **Step 2: Propagate the existing voice**

The challenge titles are already correct and must not be "improved":

> "Cutting incident triage from 40 minutes to 4"
> "Finding the 3% of invoices that were quietly wrong"

Rewrite section leads and request-page copy to match: verb-first present tense, a real number where one exists, name things specifically, state what did not work. Keep *"including the ones where the honest answer was no"* — it is the most credible sentence in the repo.

- [ ] **Step 3: Run the gate**

```bash
npm run build && npm run check:design
```

Expected: `ok copy-formula` across all pages.

- [ ] **Step 4: Manual read**

The regex catches two formulas. Read every page aloud once. Anything that sounds like it is performing confidence rather than reporting facts gets cut.

- [ ] **Step 5: Commit**

```bash
git add -A src/config src/content src/pages
git commit -m "content: rewrite copy to the challenge-title voice"
```

---

## Task 16: Photography integration

**Blocked on the shoot.** Everything before this ships without it.

**Files:**
- Add: `src/assets/photography/*`
- Modify: `src/components/Statement.astro`, detail page templates
- Possibly modify: `public/logos/*.svg` → real marks

- [ ] **Step 1: Confirm the delivery matches the brief**

Per spec §7: three aspect ratios only (16:9 bleed, 4:5 portraits, 1:1 artefacts); one grade across every frame; **no green cast** — a green cast anywhere stops the acid accent reading as a signal; no stock, not one frame; client-site work non-identifying.

Reject and re-request rather than accepting off-brief frames. One inconsistent grade undoes the coherence the whole system is built on.

- [ ] **Step 2: Place files and wire them up**

All images go in `src/assets/photography/` and render through `<Image>`/`<Picture>`. **Never `public/`** — that bypasses the optimiser and is the easiest way to lose the performance score.

- [ ] **Step 3: Re-check the LCP budget**

```bash
npm run build
ls -la dist/_astro/*.avif | sort -k5 -rn | head -5
```

Expected: hero AVIF **under 200KB**.

- [ ] **Step 4: Replace generated logo monograms**

If real marks arrived, replace `public/logos/*.svg` and update `PLACEHOLDER.md §51`. If not, movement 4 stays logo-free.

- [ ] **Step 5: Commit**

```bash
git add -A src/assets public/logos src/components
git commit -m "feat: integrate commissioned photography"
```

---

## Task 17: Cleanup and full verification

**Files:**
- Delete: `src/pages/specimen.astro`
- Modify: `astro.config.mjs` (sitemap filter), `README.md`, `PLACEHOLDER.md`

- [ ] **Step 1: Delete the specimen and its traces**

```bash
git rm src/pages/specimen.astro
```

In `astro.config.mjs`, revert the sitemap filter to:

```js
sitemap({ filter: (page) => !page.includes('/thank-you') }),
```

Confirm no candidate font entries remain — Task 2 replaced them, but verify:

```bash
grep -n "Technor\|ff-cabinet\|ff-azeret\|ff-switzer" astro.config.mjs src/ -r || echo "clean"
```

- [ ] **Step 2: Full verification battery**

```bash
npm ci
npm run check
npm run build
npm run check:links
npm run check:design
npm audit
```

Expected: `0 errors, 0 warnings, 0 hints`; `BROKEN: 0`; `TOTAL VIOLATIONS: 0`; `0 vulnerabilities`.

- [ ] **Step 3: Lighthouse on the built site**

```bash
npm run preview
npx lighthouse http://localhost:4321/cronos-ai-lab/ --chrome-flags="--headless=new" --only-categories=performance,accessibility,best-practices
```

Expected: Accessibility 100, Best Practices 100. **Performance may have dropped from 98** because the LCP is now an image — spec §9. If below 90, revisit the hero image budget before merging. SEO stays in the 60s while `blockSearchIndexing` is `true`; that is correct and expected.

- [ ] **Step 4: Confirm the launch guard is untouched**

```bash
grep -n "blockSearchIndexing" src/config/site.ts
```

Expected: `export const blockSearchIndexing = true;`. The redesign makes the site look considerably more trustworthy while the content is still invented — this guard matters more after the redesign, not less.

- [ ] **Step 5: Update the docs**

In `README.md`, rewrite the "Design system" section: the look is no longer "editorial, warm off-white, large serif headlines". Document the forest-black/acid palette, the three Fontshare faces, the six homepage movements, the ruled-list primitive, and `npm run check:design`. Replace the "Verified" numbers with the ones just measured — do not carry the old ones forward.

In `PLACEHOLDER.md §1`, remove the "accent colour is a placeholder" note and replace it with the **font licence action**: three of four faces are `itf_ffl` (Indian Type Foundry Free Font Licence), not OFL; the licence text must be read and vendored into the repo before launch; OFL fallbacks are Public Sans, Familjen Grotesk, Epilogue, Archivo.

- [ ] **Step 6: Commit and open the PR**

```bash
git add -A
git commit -m "chore: remove specimen, update docs, record verification"
git push -u origin redesign/visual-identity
```

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| §3 principles 1-4, 6-7 | Task 1 (gate), enforced by 2, 3, 4, 7, 15 |
| §3 principle 5 | Manual gates in Tasks 8, 9, 12, 14 — not automatable |
| §4.1 typefaces + weights | Task 2 |
| §4.1 licence action | Task 17 step 5 |
| §4.2 scale | Task 2 |
| §4.3 palette + contrast | Task 2, gated by Task 1 rule `contrast` |
| §4.4 geometry, grid, bleed | Task 3 |
| §4.5 motion | Task 4 |
| §5 movements 1-6 | Tasks 7-12 |
| §6 copy voice | Task 15 |
| §7 photography brief | Task 16 |
| §8 phases 0-7 | Prerequisite + Tasks 1-17 |
| §9 hero LCP risk | Task 7 step 6, Task 16 step 3, Task 17 step 3 |
| §9 weak logos risk | Task 10 preamble, Task 16 step 4 |
| §9 `SectionHeader` blast radius | Task 14 |
| §9 credibility/indexing risk | Task 17 step 4 |
| §10 out of scope | No task changes routes or collections |

**Placeholder scan:** No "TBD"/"TODO"/"similar to Task N". Every code step carries real code. The one deliberate placeholder — the grey hero JPEG in Task 7 — is explicitly temporary, justified, and replaced in Task 16.

**Type consistency:** `RuledList`/`RuledRow` prop names (`index`, `title`, `summary`, `meta`, `href`, `lead`, `capped`) are used identically in Tasks 5, 9, 10, 11, 13. Rule ids (`fonts-approved`, `display-scale`, `radius-band`, `no-atmosphere`, `hero-image`, `copy-formula`, `contrast`) match between the Task 1 implementation and every later reference. Colour token names are unchanged from the existing system throughout.

**Known gap, stated rather than hidden:** principle 5 has no automated check. A reliable one would need layout-signature comparison across sections, which is fragile enough to produce false confidence. It is a manual gate at four points instead, and Task 12 step 3 is the decisive one.
