/**
 * Single source of truth for site-wide constants.
 * Nothing here should be duplicated in a template.
 */

export const site = {
  name: 'Cronos AI Lab',
  shortName: 'AI Lab',
  domain: 'cronos-ai-lab.be',
  url: 'https://cronos-ai-lab.be',
  tagline: 'Ninety days from problem to verdict.',
  description:
    'Cronos AI Lab runs enterprise AI challenges to a measured verdict in 90 days, then builds the companies that follow, with founders, talent and customers across Belgium and beyond.',
  parentOrg: 'The Cronos Group',
  locale: 'en',
  foundedYear: 2024,
} as const;

/**
 * PLACEHOLDER LAUNCH GUARD
 *
 * While the site still contains invented startups, fabricated homepage stats
 * and an unreviewed privacy policy, keep search engines out. This emits a
 * noindex tag on every page and a blanket Disallow in robots.txt.
 *
 * To go live for real: set this to false, mirror the change in
 * scripts/generate-assets.mjs (BLOCK_SEARCH_INDEXING), run `npm run assets`,
 * and work through PLACEHOLDER.md first.
 */
export const blockSearchIndexing = true;

export const contact = {
  general: 'hello@cronos-ai-lab.be',
  press: 'press@cronos-ai-lab.be',
  address: {
    street: 'Veldkant 33A',
    postalCode: '2550',
    city: 'Kontich',
    country: 'Belgium',
  },
} as const;

export const socials = [
  { label: 'LinkedIn', href: 'https://linkedin.com/company/cronos-ai-lab' },
] as const;

/**
 * FORM BACKEND — Web3Forms.
 * A static site cannot process form posts itself, so forms POST to an
 * external endpoint. Swapping providers means changing only these two lines
 * plus the hidden-field names inside src/components/RequestForm.astro.
 *
 * Set PUBLIC_WEB3FORMS_KEY in .env (see .env.example). Without it, forms
 * render in a clearly-labelled "not yet connected" state rather than
 * silently dropping submissions.
 */
export const forms = {
  endpoint: 'https://api.web3forms.com/submit',
  accessKey: import.meta.env.PUBLIC_WEB3FORMS_KEY ?? '',
  redirectPath: '/thank-you',
} as const;

export const isFormsConfigured = forms.accessKey.length > 0;

export type NavItem = {
  label: string;
  href: string;
  /**
   * Render as a dropdown of the five Request for AI offerings.
   * `href` stays the fallback destination and the "See all" target, so the
   * entry still works if the disclosure never opens.
   */
  dropdown?: boolean;
};

export const primaryNav: readonly NavItem[] = [
  { label: 'Startups', href: '/startups' },
  { label: 'Challenges', href: '/challenges' },
  { label: 'Request for AI', href: '/request-for-ai', dropdown: true },
  { label: 'About', href: '/about' },
];

export const footerNav = {
  explore: [
    { label: 'Startups', href: '/startups' },
    { label: 'Challenges', href: '/challenges' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Cookie policy', href: '/cookies' },
  ],
} as const;
