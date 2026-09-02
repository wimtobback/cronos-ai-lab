import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const PUB = new URL('../public/', import.meta.url).pathname;

const INK = '#0B0B0C';
const PAPER = '#FBFAF8';
const ACCENT = '#2C4BFF';

/* ---- Favicon: the graph mark on ink ------------------------------------ */
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="7" fill="${INK}"/>
  <path d="M16 7.5 8.2 23h15.6L16 7.5Z" stroke="${PAPER}" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
  <circle cx="16" cy="7.5" r="3" fill="${ACCENT}"/>
  <circle cx="8.2" cy="23" r="3" fill="${PAPER}"/>
  <circle cx="23.8" cy="23" r="3" fill="${PAPER}"/>
</svg>
`;
writeFileSync(join(PUB, 'favicon.svg'), favicon);

/* ---- Apple touch icon (PNG, 180x180) ----------------------------------- */
await sharp(Buffer.from(favicon.replace('width="32" height="32"', 'width="180" height="180"')))
  .resize(180, 180)
  .png()
  .toFile(join(PUB, 'apple-touch-icon.png'));

/* ---- Open Graph card (PNG, 1200x630) ----------------------------------- *
 * Rendered from SVG with system fonts — social crawlers reject SVG, so this
 * must be a raster file. Regenerate via scripts/ if the wording changes.    */
const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <radialGradient id="bloom" cx="88%" cy="8%" r="60%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="${INK}"/>
  <rect width="1200" height="630" fill="url(#bloom)"/>

  <g transform="translate(80, 78)">
    <path d="M18 2 2 34h32L18 2Z" stroke="${PAPER}" stroke-width="2.4" stroke-linejoin="round" fill="none"/>
    <circle cx="18" cy="2" r="5" fill="${ACCENT}"/>
    <circle cx="2" cy="34" r="5" fill="${PAPER}"/>
    <circle cx="34" cy="34" r="5" fill="${PAPER}"/>
    <text x="56" y="28" font-family="Helvetica, Arial, sans-serif" font-size="25" font-weight="600" fill="${PAPER}">
      Cronos <tspan fill="${PAPER}" fill-opacity="0.6" font-weight="400">AI Lab</tspan>
    </text>
  </g>

  <text x="80" y="330" font-family="Georgia, 'Times New Roman', serif" font-size="82" fill="${PAPER}">
    We turn enterprise AI
  </text>
  <text x="80" y="418" font-family="Georgia, 'Times New Roman', serif" font-size="82" fill="${PAPER}">
    problems into companies.
  </text>

  <text x="80" y="530" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="${PAPER}" fill-opacity="0.62">
    Challenges &#183; Startups &#183; Talent &#183; Founders &#183; Academies
  </text>

  <text x="80" y="576" font-family="Helvetica, Arial, sans-serif" font-size="20" letter-spacing="2.2" fill="${ACCENT}">
    CRONOS-AI-LAB.BE
  </text>
</svg>
`;
await sharp(Buffer.from(og)).png().toFile(join(PUB, 'og-default.png'));

/* ---- robots.txt --------------------------------------------------------- *
 * Keep SITE_ORIGIN and SITE_BASE in step with astro.config.mjs, then rerun
 * `npm run assets`. robots.txt is a static file in public/, so it cannot read
 * the Astro config itself.                                                    */
const SITE_ORIGIN = 'https://wimtobback.github.io';
const SITE_BASE = '/cronos-ai-lab';

// Must mirror `blockSearchIndexing` in src/config/site.ts. See the comment
// there — both flip together when the placeholder content is replaced.
const BLOCK_SEARCH_INDEXING = true;

writeFileSync(
  join(PUB, 'robots.txt'),
  BLOCK_SEARCH_INDEXING
    ? `# Placeholder content — see PLACEHOLDER.md. Not for indexing yet.
User-agent: *
Disallow: /
`
    : `User-agent: *
Allow: /

Sitemap: ${SITE_ORIGIN}${SITE_BASE}/sitemap-index.xml
`,
);

/* ---- .nojekyll ---------------------------------------------------------- *
 * GitHub Pages runs Jekyll on branch-based deploys, and Jekyll strips any
 * path beginning with an underscore -- which is exactly Astro's _astro/
 * directory holding every stylesheet and font. The Actions artifact path we
 * use does not run Jekyll, so this is belt-and-braces against a future switch
 * to branch deploys.                                                          */
writeFileSync(join(PUB, '.nojekyll'), '');

console.log('assets written: favicon.svg, apple-touch-icon.png, og-default.png, robots.txt, .nojekyll');
