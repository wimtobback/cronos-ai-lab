# Cronos AI Lab

Static marketing site for [cronos-ai-lab.be](https://cronos-ai-lab.be).

Built with **Astro 7** and **Tailwind CSS v4**. Output is plain static files, so
it deploys anywhere that can serve a directory.

> **Before launch, read [`PLACEHOLDER.md`](./PLACEHOLDER.md).** All content in
> this repo is invented placeholder material, the forms are not connected, and
> the legal pages have not been reviewed.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
```

| Script | Does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run check` | Type-check templates and content schemas |
| `npm run assets` | Regenerate favicon, apple touch icon, OG image, robots.txt |

---

## How the site is put together

### Content drives the pages

Nothing about the Lab is hardcoded in a template. Three content collections in
`src/content/`, typed by `src/content.config.ts`:

| Collection | Files | Renders as |
|---|---|---|
| `startups` | 8 | `/startups`, `/startups/<slug>`, homepage cards |
| `challenges` | 6 | `/challenges`, `/challenges/<slug>`, homepage cards |
| `requests` | 5 | `/request-for-ai/<slug>`, homepage overview, footer, contact page |

The `requests` collection is the important one. Each markdown file carries its
own icon, copy, process steps **and form fields**, and feeds the homepage
section, the detail page and the footer at once. Adding a sixth offering is one
new `.md` file — no code change.

Schema violations fail the build rather than shipping silently.

### One config file

`src/config/site.ts` holds the name, description, addresses, email addresses,
social links, navigation and the form endpoint. If a value appears in more than
one place on the site, it lives here.

### Design system

`src/styles/global.css` is the whole visual system — colour tokens, the fluid
type scale, layout rhythm and a handful of component primitives (`.shell`,
`.eyebrow`, `.btn`, `.on-ink`, `.prose`). Rebranding means editing that one
file.

The palette is forest-black (`--color-ink`) and chalk (`--color-paper`), with
a single acid accent (`--color-accent`, `#c8f751`) reserved for marks, fills
and the rare moment that needs to shout. There is nothing between a 2px hard
edge and a 999px pill — no mid-radius, no soft shadow, no gradient. That gap
is deliberate (rule `radius-band`, `no-atmosphere`); the site reads as flat
surfaces and hard rules, not depth.

Typefaces are **Cabinet Grotesk** (display), **Switzer** (body) and **Azeret
Mono** (eyebrows and metadata), all served through Astro's font pipeline via
`fontProviders.fontshare()` in `astro.config.mjs` — self-hosted, subsetted and
preloaded, no font-CDN request at runtime. See `PLACEHOLDER.md` §1 for an
outstanding licence question on two of the three faces.

The homepage is six movements (`src/pages/index.astro`), each laid out with a
deliberately different grid shape rather than a repeated card pattern:
`Statement` (hero), `Standing` (the numbers), the work section (one lead
challenge plus a ruled list of the rest), the companies list, the full-bleed
Request for AI section, and `Close`. Index and detail pages elsewhere
(`startups`, `challenges`) reuse the same `RuledList`/`RuledRow` primitive
instead of a card grid — a numbered, ruled row of title/summary/meta that
replaces borders-and-shadows with a hairline and a baseline.

Geometry runs on a 12-column `.shell` grid with a `.bleed` utility for the
sections that need to run edge-to-edge inside it. The whole system holds
itself to **one motion per page** (`src/components/Reveal.astro`'s
`IntersectionObserver` reveal) — no per-element stagger, no hover choreography
beyond simple colour/opacity transitions.

`npm run check:design` is the executable gate for all of the above: it builds
`dist/`, then checks every page against the approved font list, the display
type-scale floor, the radius band, the no-atmosphere rule, hero image budget,
the copy formula and colour contrast. `TOTAL VIOLATIONS: 0` is the bar for
merging any change that touches `global.css` or a page template.

### JavaScript

Two small scripts, both progressive enhancement:

- `src/components/Reveal.astro` — one `IntersectionObserver` for scroll
  reveals, plus a small inline guard in `BaseLayout.astro`.
- `src/components/Nav.astro` — dismissal behaviour for the Request for AI
  dropdown (outside click, Escape, tabbing out). The dropdown is a native
  `<details>`, so without JS it still opens and closes on click.

The guard matters. Content is hidden for animation **only** if that inline
script runs and confirms both `IntersectionObserver` support and that the user
has not asked for reduced motion. If anything in the chain fails, the page
renders fully visible rather than blank. A 2.5-second timeout is a second
safety net.

The mobile menu is a native `<details>` element with no JavaScript at all; it
lists the five Request for AI offerings inline rather than nesting a second
disclosure inside the first.

### Forms

Every form is a plain HTML `POST` to Web3Forms. Fields for the five Request for
AI pages come from frontmatter, so `src/components/RequestForm.astro` is the
only form component in the codebase.

Without `PUBLIC_WEB3FORMS_KEY` set, forms render disabled behind a visible
"not connected yet" notice with a mailto fallback. They never silently drop a
submission. See `PLACEHOLDER.md` for how to connect them.

---

## Deploying

Deployed to **GitHub Pages** at
<https://wimtobback.github.io/cronos-ai-lab> via `.github/workflows/deploy.yml`.
Every push to `main` type-checks, builds, link-checks and publishes. The
workflow can also be run manually (`workflow_dispatch`) to re-deploy without a
code change — useful after adding the forms secret.

Pages must be configured with **Source: GitHub Actions**, not "Deploy from a
branch". The branch path runs Jekyll, which strips `_astro/` and takes every
stylesheet and font with it.

To enable forms, add `PUBLIC_WEB3FORMS_KEY` under Settings → Secrets and
variables → Actions, then re-run the workflow. No file changes needed.

### ⚠️ Sub-path deploy: always use `withBase()`

The site is served from `/cronos-ai-lab/`, **not** from `/`. Astro prefixes
bundled assets (`_astro/`, fonts) automatically, but it does **not** rewrite
hand-written `href`/`src` strings or anything referenced out of `public/`.

So when you add a link or reference a `public/` asset, wrap the path:

```astro
---
import { withBase } from '../lib/url';
---
<a href={withBase('/about')}>About</a>
<img src={withBase(startup.data.logo)} alt="" />
```

Raw `href="/about"` will 404 in production while working fine in `astro dev`.
`npm run check:links` catches this — it fails any internal link missing the
base prefix — and the workflow runs it on every push.

`src/config/site.ts` and content frontmatter deliberately store **raw** paths
(`/about`, `/logos/route33.svg`). `withBase()` is applied at the render site, so
authoring stays plain.

### Moving to cronos-ai-lab.be

Because every path goes through `withBase()`, switching domains is config only:

1. `astro.config.mjs` → `site: 'https://cronos-ai-lab.be'`, `base: '/'`
2. Add `public/CNAME` containing `cronos-ai-lab.be`
3. Update `SITE_ORIGIN`/`SITE_BASE` in `scripts/generate-assets.mjs`, then
   `npm run assets` to regenerate `robots.txt`
4. DNS: `A` records for the apex to `185.199.108.153`, `.109.153`, `.110.153`,
   `.111.153` (plus `AAAA` for IPv6); `CNAME www → wimtobback.github.io`
5. Turn on "Enforce HTTPS" once GitHub has provisioned the certificate

No template changes.

### Build format

`build.format: 'file'` emits `about.html` rather than `about/index.html`, so
GitHub Pages serves `/about` directly instead of 301-redirecting to `/about/`.
That keeps the served URL identical to the links and canonicals the site emits.
`trailingSlash: 'never'` matches.

---

## Verified

Re-checked after the visual identity redesign (Task 17):

- **`astro check`:** 0 errors, 0 warnings, 0 hints
- **`npm run build`:** 29 pages built
- **`npm run check:links`:** `BROKEN: 0` — every internal link and anchor
  resolves and carries the `/cronos-ai-lab` base
- **`npm run check:design`:** `TOTAL VIOLATIONS: 0` across all 7 rules
  (`fonts-approved`, `display-scale`, `radius-band`, `no-atmosphere`,
  `hero-image`, `copy-formula`, `contrast`) — see "Design system" above
- **`npm audit`:** 0 vulnerabilities
- Routes: all pages return **200 with no redirect** (no 301 to a trailing
  slash); unknown paths return a real 404 with the styled 404 page
- Assets: `_astro/` CSS and fonts serve 200 — the Jekyll underscore trap is
  not triggered
- Contrast: covered by the `contrast` rule in `check:design`, above
- Responsive: no horizontal overflow at 375, 768 or 1440

**Lighthouse**, measured on this redesign — *note these were run against a local
`astro preview` build, not the live deployment, so they are not directly
comparable to the pre-redesign figures, which were measured on GitHub Pages:*

| Route | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/` | 99 | 100 | 100 | 92 |
| `/request-for-ai/challenges` | 100 | 100 | 100 | 92 |
| `/startups/route33` | 99 | 100 | 100 | 92 |

Re-measured after the visual consistency pass (card grids to ruled lists, the
detail-page rail, the ink bands). Performance moved by one point in either
direction on two routes, which is the run-to-run noise the first caveat below
describes, not a regression.

Zero failing accessibility audits on all three. The single failing SEO audit is
`is-crawlable`, which is `blockSearchIndexing` doing its job (`PLACEHOLDER.md`
§8) — expected, not a regression.

> **Two caveats on the Performance figures.** First, Total Blocking Time is
> CPU-bound: an early run on a loaded machine (load average 10.6) reported 72
> with TBT 1,820 ms, while three later runs on the same build reported 99–100
> with TBT 0 ms. Treat any single local run with suspicion. Second, the hero
> image is **no longer a placeholder**. The Cronos incubator photograph landed,
> and the `/` row above was re-measured against it — that is where the 100
> became a 99. The design spec's LCP budget (§9) is now genuinely exercised and
> met: the AVIF the browser picks is 17 KB at 768w, 42 KB at 1280w and 89 KB at
> 1920w, against a ~150–200 KB budget. LCP is 2.2 s, and the LCP element is now
> the hero image rather than a text node, which is principle 6 working as
> intended. `uses-responsive-images`, `modern-image-formats` and
> `unsized-images` all pass.

Re-run these with `npm run check:links` / `npm run check:design` (after a
build) and:

```bash
npx lighthouse https://wimtobback.github.io/cronos-ai-lab/ --chrome-flags="--headless=new"
```
