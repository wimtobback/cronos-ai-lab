// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  // Deployed as a GitHub Pages *project* page, so the site lives under a
  // sub-path. `site` is the origin; `base` is the sub-path. To move to the
  // cronos-ai-lab.be custom domain later, set site to that domain and base to
  // '/', and add public/CNAME — no template changes needed, because every
  // internal path goes through withBase() in src/lib/url.ts.
  site: 'https://wimtobback.github.io',
  base: '/cronos-ai-lab',
  trailingSlash: 'never',
  // 'file' emits about.html rather than about/index.html. GitHub Pages then
  // serves /about directly instead of 301-ing to /about/, which keeps the
  // served URL identical to the links and canonicals we already emit.
  build: { format: 'file' },
  integrations: [
    // /thank-you carries a noindex meta tag; listing it in the sitemap would
    // contradict that.
    sitemap({ filter: (page) => !page.includes('/thank-you') }),
    icon(),
  ],
  vite: { plugins: [tailwindcss()] },

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
});
