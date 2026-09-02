# Visual identity redesign — design

**Date:** 2026-08-28
**Status:** approved. Phase 0 closed — Cabinet Grotesk + forest-black/acid, chosen
against the `/specimen` page at full size.
**Scope:** full re-art-direction — visual system, homepage narrative, copy voice

---

## 1. Problem

The site reads as AI-generated. Not because it is badly built — `src/styles/global.css`
is a disciplined token system and the accessibility and performance work is real —
but because every individual choice is the *modal* choice a language model makes.

Measured against the two reference sites the user supplied:

| Reference | What it is | Type | Geometry | Imagery |
|---|---|---|---|---|
| **cronos-ai-lab (today)** | — | Instrument Serif + Inter + JetBrains Mono, display to `5.5rem` | `0.75rem` cards + hover lift + shadow | **0 photographs** |

Both references are sans-only, avoid default blue, avoid mid-range radii, and are
roughly half imagery. The current site is none of those things.

Findings taken from the references' shipped HTML/CSS, not from screenshots — the
Chrome extension was unavailable during this design session.

### The specific tells

| Tell | Location |
|---|---|
| Blurred radial-gradient accent bloom | `src/components/Hero.astro:14-18` |
| Instrument Serif display face | `astro.config.mjs` |
| `#2c4bff` blue-violet accent | `src/styles/global.css:38` |
| `border-radius: 0.75rem` + hover lift + soft shadow | `global.css` `.card-interactive` |
| Icon-in-a-circle | `src/components/RequestCard.astro:14` |
| Three-stat hairline grid | `src/components/Hero.astro:47` |
| Staggered `i * 60` fade-up reveals | `src/pages/index.astro`, throughout |
| Three homepage sections built from one identical machine | `src/pages/index.astro` |
| Zero photography | `public/` — 8 generated SVG monograms only |

---

## 2. Direction

Decided with the user:

- **Imagery:** real photography is being commissioned.
- **Brand governance:** free rein — the Lab gets its own identity, with a light
  endorsement relationship to The Cronos Group.
- **Typefaces:** open-licensed only, and deliberately not the current defaults.

---

## 3. Principles

Written as tests so "looks AI-generated" is falsifiable and checkable against the
built site.

1. **Sans-only.** No serif face ships.
2. **Scale contrast is the art direction.** Display maximum ≥ 7.5rem; no section
   built only from mid-range sizes. Target range ≈ 10×.
3. **Hard edges, no middle ground.** No radius between 8px and 999px anywhere.
   `2px` for surfaces, `999px` for buttons, `50%` for avatars.
4. **No atmosphere effects.** Zero decorative `blur()`, zero decorative
   `radial-gradient`.
5. **Every section earns its own shape.** No two consecutive sections share a grid
   pattern.
6. **Photography carries weight.** At least one full-bleed photograph above the fold.
7. **Specificity beats formula in copy.** No "We [verb] X into Y" opening claim; no
   rhetorical tricolons.

Principle 5 carries real cost: homepage sections stop sharing `SectionHeader` and
get individual layouts. Principle 6 carries a dependency and a performance risk
(see §8).

### Dropped during design

An em-dash density rule was proposed and then dropped. Measurement showed 19
em-dashes across 3,011 words — 1 per 158, already inside the proposed target. The
problem is placement, not density: two of the nineteen sit in the site's two most
visible sentences, both pairing a drumroll dash with a tricolon.

---

## 4. Visual system

### 4.1 Typefaces

Astro 7.2.4 ships `fontProviders.fontshare()` natively (verified: provider list is
`adobe, bunny, fontshare, fontsource, google, googleicons, local, npm`). Fontshare
faces therefore self-host, subset and preload through the existing pipeline with no
font files in the repo and no runtime CDN request.

**Decided at Phase 0**, judged on `/specimen` at full size rather than from a table:

| Role | Face | Weights shipped |
|---|---|---|
| Display | **Cabinet Grotesk** | `700` only |
| Text | **Switzer** | `400`, `500` |
| Mono | **Azeret Mono** | `500` |

Technor was carried as the display alternate and rejected.

Note that `/specimen` currently loads Cabinet Grotesk at `500/700/800` and Technor
at `500/600/700` for comparison purposes. Phase 1 narrows this to the table above;
Phase 7 deletes the rest with the page.

**Licence status — resolve before launch.**

| Face | Licence type |
|---|---|
| Azeret Mono | `sil_ofl` — SIL Open Font Licence |
| Switzer, Cabinet Grotesk, Technor | `itf_ffl` — Indian Type Foundry Free Font Licence |

Licence *types* confirmed via the Fontshare API. The FFL *text* could not be
retrieved (Fontshare's licence pages are JS-rendered). It is free for commercial
use but is proprietary rather than OFL, so someone must read it and vendor a copy
into the repo. If a non-OFL licence is unacceptable, Fontshare also carries OFL
faces (Public Sans, Familjen Grotesk, Epilogue, Archivo) and the swap is one line
in `astro.config.mjs`.

### 4.2 Scale

```css
--text-display: clamp(3.25rem, 1rem + 9vw, 8rem);  /* lh 0.92, ls -0.035em */
--text-h2:      clamp(2rem, 1.4rem + 2.6vw, 3.5rem);
--text-meta:    0.6875rem;                          /* ls 0.14em, mono, caps */
```

### 4.3 Palette

Working default: **forest-black + chalk + acid**. Neither reference goes near
default blue, and both let a desaturated ground carry a saturated accent — which is
also what lets photography supply the colour.

```
ink #101614   ink-raised #18201d   paper #f2f1ea   paper-raised #ffffff
muted #5f6560   muted-invert #9aa39c   rule #dedcd2   rule-invert #262e2a
accent #c8f751   accent-ink #41631a   accent-wash #eaf6cf
```

Measured at build time on `/specimen`: **10/10 pairs pass WCAG AA.** Acid on ink is
14.72:1; `accent-ink` holds 6.13:1 on chalk, so the accent works for body links
without a further darkened variant.

Alternates carried in the specimen: graphite + signal orange, ink + clay. Both also
pass 10/10.

> Decorative hairline rules are deliberately excluded from the contrast table.
> They are exempt from WCAG contrast minima; scoring them as text produces a bogus
> failure. The non-text check that does apply (1.4.11, 3:1) is run on focus rings.

### 4.4 Geometry

- Radius `2px` surfaces / `999px` buttons / `50%` avatars. Nothing between.
- Hairlines become **structural column dividers**, not section separators.
- A real **12-column grid** on `.shell`, plus a `.bleed` escape for full-width
  imagery. Principle 5 is not achievable without this.
- Vertical rhythm deliberately unequal between sections, replacing constant
  `py-section`.

### 4.5 Motion

Motion budget: **one event per page.** The staggered reveal is cut.

`Reveal.astro`'s guard architecture is kept as-is — the inline support check, the
reduced-motion gate and the 2.5s failsafe are well built and should simply be
pointed at one element instead of twenty. Hover states change colour and rule
weight; never `translateY` plus a soft shadow.

---

## 5. Homepage narrative

Today: three runs of one machine — `SectionHeader` → equal-column card grid →
`gap-5` → `i*60` stagger.

Six movements, each a different shape:

| # | Movement | Shape | Change |
|---|---|---|---|
| 1 | Statement | Full-bleed photograph, one line at 8rem, one CTA | Kills the 3-stat grid |
| 2 | Standing | Dense horizontal logo strip, hairline-divided | Where "6,000 engineers" belongs — context, not trophy |
| 3 | The work | Asymmetric 7/5: one challenge at length, rest a ruled list | Moved ahead of portfolio; list not grid |
| 4 | The companies | Two-column ruled list: logo, tagline, sector | No longer a 5-across card grid |
| 5 | Request for AI | Numbered index 01–05, large type, hairline rows | Kills icon-in-circle; promoted in weight |
| 6 | Close | Ninety-day promise + contact. Short. | New |

**Challenges before portfolio.** The site currently shows outputs (8 startups)
before establishing the input. 

**Lists instead of card grids.** A hairline-ruled list is a strong anti-generated
signal precisely because a card grid is what every generator reaches for. It also
suits the content — eight one-line taglines do not need eight bordered boxes.

**The three-stat row goes regardless of aesthetics.** `PLACEHOLDER.md` records those
numbers as fabricated; making fabricated stats the most prominent above-fold element
is a launch risk independent of design.

---

## 6. Copy voice

### The voice already exists on the site

The challenge titles are the best writing in the repo and carry no AI flavour:

> "Cutting incident triage from 40 minutes to 4"
> "Finding the 3% of invoices that were quietly wrong"
> "Reading sixty years of maintenance logs"

Verb-first, a real number, no adjectives, no flourish. And one line in
`index.astro` — *"including the ones where the honest answer was no"* — is the most
credible sentence on the site, because it costs something to say.

The rewrite propagates this voice upward into the hero and section leads, which
currently speak a softer, different language. It does not invent a tone.

### Rules

**Out:** "We [verb] X into Y" as an opening claim · rhetorical tricolons ·
dash-drumroll before a flourish · abstract nouns as subjects (`site.ts:10`,
"Where AI ambition becomes a company") · unevidenced superlatives.

**In:** verb-first present tense · a real number where one exists · name things
specifically · state what did not work · short declaratives, fewer of them.

Current violations at highest visibility:

- `Hero.astro` — "…Belgium's largest organisations **—** then **builds, funds and
  scales** the companies…"
- `index.astro` — "a problem, a company, **a career move or a team to train — there
  is a front door for it**."

---

## 7. Photography brief

Coherence in the references comes from a shared grade, not a large count. The brief
is therefore mostly rules.

**Three aspect ratios, only three:** 16:9 bleed, 4:5 portraits, 1:1 artefacts.

**Shot pools (~1.5 days):**

| Pool | Duration | Supplies |
|---|---|---|
| The Lab — Veldkant 33A, rooms, whiteboards, people working, environmental not posed | half day | Movement 1, about page |
| 8 founder portraits — one setup, one focal length, one background, shot identically | half day | Movement 4 |
| Artefacts and environments — screens, printouts, machine details, control rooms | half day | Challenge pages |

**Grade rules:** one grade across every frame; slightly desaturated, cool shadows.
**Keep green out of the grade** — against an acid-green accent, any green cast stops
the accent reading as a signal. **No stock, not one frame** — stock is as loud a
generated-content tell as a gradient bloom.

**Confidentiality:** several challenges are marked "Confidential client", so
client-site photography must be non-identifying — detail and artefact shots rather
than recognisable premises.

**Two constraints added during implementation (Task 7 review, verified against the built page):**

1. **16:9 only — there is no portrait fallback.** The hero uses `object-fit: cover` with
   `object-position: center 40%`. On viewports taller than 16:9 (most portrait phones) that
   anchor crops from the *bottom* — which is exactly where the headline's quiet region is
   meant to live. A portrait-orientation source would break the lower-third assumption
   entirely, since vertical positioning does almost nothing once the crop is horizontal.

2. **There is no code-level legibility insurance.** `.on-ink` sets paper-white text with no
   `text-shadow`, no `backdrop-filter` and no blend mode. Legibility over the photograph
   depends entirely on the frame having a quiet region. If a delivered frame is busy where
   the headline sits, the non-scrim remedy is a subtle `text-shadow`
   (`0 1px 12px rgb(0 0 0 / 0.35)`) on `.statement-copy` — it costs nothing when the frame is
   good and does not read as a generated device the way a gradient scrim does. A gradient
   scrim remains rejected.

**Technical:** images in `public/` bypass Astro's optimiser. `astro:assets` is
currently imported only for `Font`. Photography must live in `src/assets/` and go
through `<Image>`/`<Picture>` to ship as AVIF/WebP with generated srcsets.

---

## 8. Build order

| Phase | Work | Blocks on |
|---|---|---|
| 0 | **Decide** face + palette from `/specimen` | user |
| 1 | Foundation: rewrite `global.css`, swap fonts, 12-col grid + `.bleed`, radius and motion rules | 0 |
| 2 | Component primitives: buttons, ruled-list replacing `.card`, `Nav`, `Footer`, form fields | 1 |
| 3 | Homepage movements 1–6 with shot-accurate image placeholders | 2 |
| 4 | Inner pages: startups, challenges, request-for-ai, about, contact, legal, 404 | 2 |
| 5 | Copy pass across content and `site.ts` under §6 rules | — |
| 6 | Photography integration via `astro:assets` | shoot |
| 7 | Verify and clean up | all |

Only phase 6 depends on the shoot. Nothing else waits on it.

**Phase 7 checklist:** re-run the README verification battery — `check:links`, route
and redirect check, contrast pairs, responsive at 375/768/1440, Lighthouse, `astro
check`, `npm audit`. Delete `src/pages/specimen.astro`, its four font entries in
`astro.config.mjs`, and its sitemap exclusion.

---

## 9. Risks

| Risk | Detail | Mitigation |
|---|---|---|
| Hero LCP | Principle 6 puts a photograph above the fold. LCP is currently a text node, which is why Performance sits at 98. This is the main threat to that score. | ~150–200KB AVIF budget, `fetchpriority="high"`, preload, no other above-fold image |
| Font licence | Three of four faces are ITF FFL, not OFL; text unread | Read and vendor the FFL; OFL fallback faces identified in §4.1 |
| Weak logos | `public/logos/*.svg` are generated monograms (`PLACEHOLDER.md §51`). A ruled list exposes weak marks far more than a card grid hides them. | Real marks before movement 4 ships, or keep movement 4 logo-free |
| `SectionHeader` blast radius | Used by inner pages, not only the homepage | Phase 2 handles it before phases 3 and 4 |
| Credibility outrunning content | The redesign makes the site look considerably more trustworthy while startups, challenges and stats are still invented | `blockSearchIndexing` stays `true` until `PLACEHOLDER.md` is worked through |

---

## 10. Out of scope

Route changes, page removals, and any restructuring of the content collections. The
information architecture is sound and the `requests` collection is carrying the
five offerings cleanly — the redesign changes how pages look and read, not what
pages exist.
