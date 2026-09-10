# What is placeholder, and where to replace it

Everything in this file is invented content that exists so the site looks
finished. **None of it is real.** Work down this list before launch.

---

## 1. Font licence — action needed before launch

The three typefaces (`astro.config.mjs` → `fonts`) are served through
`fontProviders.fontshare()`. Of the four Fontshare faces used or evaluated
during the redesign, **three ship under `itf_ffl`** (Indian Type Foundry Free
Font Licence) — **not** SIL OFL:

| Face | Licence |
|---|---|
| Cabinet Grotesk (display) | `itf_ffl` |
| Switzer (body) | `itf_ffl` |
| Azeret Mono (mono) | `sil_ofl` |

The `itf_ffl` text could not be retrieved programmatically — Fontshare's
licence pages are JS-rendered, so it was not read as part of this redesign.
**Before launch, someone must open the licence for each `itf_ffl` face, confirm
its terms permit this use, and vendor a copy of the licence text into the
repo** (e.g. `public/fonts/LICENCE-<face>.txt`).

If a non-OFL licence turns out to be unacceptable, OFL alternatives are
available on Fontshare and the swap is a one-line change per entry in
`astro.config.mjs`: **Public Sans**, **Familjen Grotesk**, **Epilogue** and
**Archivo**.

The accent colour is no longer a placeholder — the palette (forest-black /
chalk / acid, `--color-accent: #c8f751`) is decided; see "Design system" in
`README.md`.

Logo: the graph mark lives in **two** places, both inline SVG —
`src/components/Logo.astro` (site header and footer) and
`scripts/generate-assets.mjs` (favicon and OG card). Update both, then run
`npm run assets`.

---

## 2. Company facts

| Placeholder | Where | Note |
|---|---|---|
| Address — Veldkant 33A, 2550 Kontich | `src/config/site.ts` → `contact.address` | Guessed, but **corroborated twice**: <https://route33.ai> gives it in its footer with VAT BE 0467.132.994, and <https://sliceworkz.com> lists it as its first Belgian office (with Merelbeke and Hasselt). Both are real companies now in `startups` (§3). So it is a genuine Cronos address. Still confirm it is the address the *Lab* should publish. |
| `hello@cronos-ai-lab.be`, `press@cronos-ai-lab.be` | `src/config/site.ts` → `contact` | Must exist before launch — forms and CTAs point here. |
| Founded 2024 | `src/config/site.ts` → `site.foundedYear` | |
| ~~"8 ventures · 24 challenges · 6,000+ engineers"~~ | ~~`src/components/Hero.astro` → `stats`~~ | **Removed.** The redesign deleted `Hero.astro` and its `stats` prop; the hero no longer carries any statistics. Nothing to fix here — kept only so this row isn't rediscovered as a live issue. |
| Cronos scale — "more than 9,000 people" | `src/components/Standing.astro`, `src/pages/about.astro`, `requests/talent.md`, `requests/startups.md` | **The 9,000 is confirmed by the Lab** (route33.ai independently states "9,000 network professionals"). The September 2026 review standardised all four places on "more than 9,000 people" and **removed "600 companies" and "9,000 engineers"**: only the headcount was confirmed, not the company count or that they are all engineers. Re-add either only once confirmed. |
| 2024 / 2025 / 2026 history entries | `src/pages/about.astro` → `timeline` | Invented. |
| Three principles | `src/pages/about.astro` → `principles` | Written in the Lab's voice; keep, edit or replace. The fourth ("We say no out loud") was cut in the September 2026 review — see §10. |

**Two contradictions found and corrected — still need human sign-off.** While
rewriting copy, Task 15 found `about.astro` claiming "twenty-four enterprise
challenges" when the repo's `challenges` collection has six files, and
claiming a 2026 "first Series A" milestone that the (since deleted) `bestek`
entry already claimed for a 2024-cohort venture. Both were internally
contradictory, invented figures. The copy now states only the verifiable fact
— "Five ventures sit in the portfolio", which is the real count since the
eight invented startups were removed (§3) — with no challenge count and no
Series A claim.

The 2024 and 2025 timeline entries named and counted those invented ventures,
so they were trimmed when the ventures went: the years remain, the venture
names and counts are gone. What is left is still invented history and still
needs a human, same as every other row in this table.

---

## 3. Startups — `src/content/startups/*.md`

Five files, and **all five are real companies**, added from their own public
websites. The eight invented ones — `sondr`, `kliniq`, `portbrain`, `statuut`,
`fieldnote`, `voltmap`, `bestek`, `palet` — and their generated monogram logos
have been deleted. Nothing in this collection is placeholder any more.

| Slug | Status |
|---|---|
| `threatworks` | Real — <https://threatworks.be>. Copy, founder names and roles taken from their site. Logo is their own favicon mark, resized to 256px. |
| `baboonlabs` | Real — <https://baboonlabs.ai>, part of The Cronos Group. Copy taken from their site. No founders listed (their site names none); the detail page omits the Founders row. Logo is their own mark composited onto their black brand tile, because the raw mark is white and would be invisible on paper. |
| `route33` | Real — <https://route33.ai>, built inside The Cronos Group. Copy taken from their site, which is server-rendered, so it was read directly. Name styled `route_33`, as their site writes it. No founders listed. Logo is their own `favicon.svg`, used unmodified. Their site carries a beta disclaimer ("claims and commitments on this page may not be held against route33"), so the entry states the product and its status, not commitments. **The compliance sentence (GDPR/DPA terms, ISO 27001 and NIS2 "audited under Cronos", EU AI Act) was removed in the September 2026 review**: group-level assurance must not be implied for a product feature in beta. The entry now links to route33.ai instead. Restore a compliance claim only with approved, precisely scoped wording from route_33. |
| `sliceworkz` | Real — <https://sliceworkz.com>, a brand of XTi — Xtreme Integrations NV (VAT BE 474.267.543). Static HTML, read directly. Their about page names three people as **contacts**, not founders — Günther Van Roey, Sam Waegeman, Aewyn Seldenslach — so `founders` is left empty rather than mislabelling their roles. Logo is their own `favicon.png`, their square icon mark, padded 64x63 to 64x64. **It is only 64px**, so it is soft on a 2x display at the 40px list size; swap it if a larger icon exists. |
| `aigeneers` | Real — <https://aigeneers.eu>. Copy taken from their site. **The founder came from the Lab, not the site**: Yorrick Schoonheydt appears there as an author, never labelled founder, so that field is sourced from you rather than from the page. Logo is their own goggles glyph, lifted as vector from the clip group inside `full-logo-white.svg` and set on an ink tile — their `favicon.ico` is only 32px and their other logo is a wide wordmark, so neither fitted the 40px holder. |

For all five, `cohort: 2026` and `stage: "Incubating"` were **chosen, not
sourced** — none of the sites states a cohort or a funding stage. Confirm each
with the company before launch, since both fields render publicly on the card
and the detail page. (September 2026 review: the Lab keeps the "Startups"
framing and will supply the real stage and cohort per company.)

**To add a real startup:** create `src/content/startups/<slug>.md`. The URL
becomes `/startups/<slug>`. Required frontmatter:

```yaml
---
name: "Acme"
tagline: "One sentence on what changes for the user."
logo: "/logos/acme.svg"     # put the file in public/logos/
cohort: 2026
sectors: ["Manufacturing"]
stage: "Seed"               # Incubating | Pre-seed | Seed | Series A
website: "https://acme.com" # optional
founders:                   # optional; no Founders row renders when empty
  - { name: "Full Name", role: "CEO" }
publishDate: 2026-06-18     # sorts "latest 5" on the homepage
draft: false                # true hides it from the build entirely
image: "../../assets/photography/acme.webp"   # optional, see below
imageAlt: "What the photograph shows"         # optional, "" if decorative
---

Markdown body renders on the detail page.
```

The build fails loudly if frontmatter does not match the schema in
`src/content.config.ts`. That is deliberate — a typo should never ship silently.

**Photography.** `image` is optional on `startups`, `challenges` and `requests`.
An entry without one renders exactly as before — there is no placeholder state
and no grey box. Give one a path and a full-bleed band appears
(`src/components/Figure.astro`), processed by `astro:assets` into avif + webp at
three widths. Put files in `src/assets/photography/`; the path in frontmatter is
relative to the markdown file, so `../../assets/photography/<name>.webp`.

The `/about` page has no equivalent slot: it is a page rather than a content
entry, so a band there needs a real file and a decision about where it sits.
Worth adding when the commissioned shoot lands.

---

## 4. Challenges — `src/content/challenges/*.md`

Six invented engagements. **Clients are deliberately anonymous** ("A national
telecom operator") rather than named, so nothing here attributes a fabricated
result to a real organisation. If you name a real client, get written approval
first, and make sure the `outcome` figure is one they will stand behind.

**Every entry carries a required `status`.** All six are
`status: illustrative`, which labels them on every surface — "Illustrative
example" eyebrow, "Illustrative outcome" instead of "Result", no year, a note
in the facts rail, and the headings "The kinds of problems we take on" instead
of "Problems we were asked to solve". The labelling lives in one place,
`src/lib/challenges.ts`.

**To add a real engagement:** set `status: engagement`. It then shows its year
and "Result". Before publishing one, have in writing: client approval, the
measurement dates, the baseline, the scope (and sample size where relevant),
and the Lab's role. The "Problems we were asked to solve" headings return only
once no illustrative entry is left.

Same authoring pattern as startups; schema in `src/content.config.ts`.

---

## 5. Request for AI — `src/content/requests/*.md`

Five files: `challenges`, `startups`, `talent`, `founders`, `labs`.

These drive **four** things at once — the homepage overview rows, the five
`/request-for-ai/<slug>` pages, the footer list and the "Also a way in for"
links under the homepage hero. The Challenges file's `process` also renders as
the homepage's 90-day section. Editing one file updates all of them. Adding a
sixth `.md` file adds a sixth offering everywhere, no code change needed.

The copy is written to be usable as-is, but it makes commitments on the Lab's
behalf that need a human to confirm:

- "We reply within five working days" — appears on every form and the
  thank-you page (`src/components/RequestForm.astro`, `src/pages/thank-you.astro`).
- "90 days from intake to verdict" — homepage (hero and process section),
  challenges page, about page.
- "Half a day on a real problem … Paid." — the talent page's process step.
- "Pre-seed funding from the Lab" — the founders page.
- "Joint publication is on the table, with publication rights agreed in
  writing before the work starts" — the labs page. Softened in the September
  2026 review from an unconditional promise that contradicted the page's own
  process step; confirm it still matches what research agreements allow.
- "Secondments and residencies that actually run" — the labs page.
- Early access and a route to production for technology partners — the labs
  page. Depends on partner agreements that may not exist yet.

`formFields` in each file controls that page's form. See the schema for the
allowed field types.

---

## 6. Forms — not connected

Forms currently render with a visible **"This form is not connected yet"**
notice, disabled inputs, and a mailto fallback. They cannot silently lose a
submission.

To connect:

1. Create a free access key at <https://web3forms.com> for the mailbox that
   should receive submissions.
2. `cp .env.example .env` and set `PUBLIC_WEB3FORMS_KEY=...`
3. Set the same variable in the host's build environment.
4. Rebuild. The notice disappears and inputs enable automatically.

Each form sends a `subject` of `"<Offering> — cronos-ai-lab.be"`, so inbox
rules can route the five routes to different people.

**Swapping provider** (Formspree, Tally, an internal endpoint) means changing
`forms.endpoint` in `src/config/site.ts` and the four hidden fields at the top
of `src/components/RequestForm.astro`. Nothing else touches the form backend.

---

## 7. Legal — needs review

`src/pages/privacy.astro` and `src/pages/cookies.astro` are drafts that
accurately describe what the site does today, but they carry a visible
**"Draft pending legal review"** banner. Cronos legal must review both, then
delete the banner block at the top of each file.

Both pages become wrong the moment analytics are added. See the commented
block in `src/layouts/BaseLayout.astro`.

---

## 8. Search indexing is blocked — turn it on when content is real

Every page currently emits `<meta name="robots" content="noindex, nofollow">`
and `robots.txt` is a blanket `Disallow: /`. That is deliberate: invented
startups, fabricated homepage numbers and an unreviewed privacy policy should
not be indexable under a real name.

**Two flags, flip both together:**

| File | Constant |
|---|---|
| `src/config/site.ts` | `blockSearchIndexing = true` → `false` |
| `scripts/generate-assets.mjs` | `BLOCK_SEARCH_INDEXING = true` → `false` |

Then run `npm run assets` to regenerate `robots.txt`, and rebuild. Do this only
after working through sections 1–7 above.

---

## 9. Not yet decided

- **Hosting.** Now deployed to GitHub Pages at
  <https://wimtobback.github.io/cronos-ai-lab> via `.github/workflows/deploy.yml`.
  The `cronos-ai-lab.be` domain is **not** pointed at it yet — see "Moving to
  cronos-ai-lab.be" in `README.md`; that switch is config-only.

  Because the site is served from a sub-path, **every new internal link must go
  through `withBase()`** (`src/lib/url.ts`). A raw `href="/about"` works in
  `astro dev` and 404s in production. `npm run check:links` catches it and the
  deploy workflow runs that check on every push.
- **Analytics.** None shipped. See the note in `BaseLayout.astro`.
- **Dutch/French.** English only. Astro's i18n routing would be the route in.
  The September 2026 review agrees: validate audience demand first.

---

## 10. Owner decisions from the September 2026 review

An external review (9 September 2026) was triaged against this repo. What
could be fixed in code was; these items need a person with the facts. Do not
invent any of them to fill a gap — publish the agreed policy, or say what is
discussed during intake.

**Decided, not acted on**

- Forms stay as described in §6 for now.
- Navigation labels (Startups / Challenges / Request for AI / About) stay.
- The portfolio keeps the "Startups" framing (§3).

**Needs input**

- **Stage, cohort and leadership** for each of the five startups (§3).
- **route_33 compliance wording**, approved and precisely scoped (§3).
- **Business model sentence** for the challenges page. Draft for sign-off:
  "An engagement ends in one of four ways: handover to your team, an ongoing
  partnership, a new venture, or a documented stop. Anything beyond the 90
  days is a separate agreement."
- **Commercial details per audience**, only where agreed:
  - Challenges: indicative commercial model; when the 90 days starts; data and
    staff access needed; the exact deliverable; ownership and production
    responsibility.
  - Startups: geography and eligibility; how introductions work; paid support
    versus investment; equity expectations; selection timing.
  - Founders: funding range; equity and control principles; full-time
    expectations; founder compensation; criteria from sprint to incorporation.
  - Talent: open roles or expression-of-interest status; location and remote
    policy; employment or freelance; languages; compensation guidance.
  - Labs: concrete collaboration examples; who funds; data-access conditions;
    how IP and publication decisions work.
  - About: named leadership and delivery team; the governance relationship
    with Cronos; verified history.
- **One real, approved example of a stopped project**, and what the customer
  learned. The site no longer repeats "we say no" claims; one example would
  demonstrate it instead.
- **Real case studies** with `status: engagement` (§4).
- **Team photography and product screenshots.** A team section on About and
  the homepage, and screenshots on startup pages, wait for real assets.
  `Figure.astro` already takes an `image` on any content entry.
