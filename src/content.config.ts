import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/** Form field descriptor — drives RequestForm.astro from frontmatter. */
const formField = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(['text', 'email', 'tel', 'url', 'textarea', 'select']).default('text'),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  /** Only for type: select */
  options: z.array(z.string()).optional(),
  /** Render at half width on desktop, so two fields share a row. */
  half: z.boolean().default(false),
});

const startups = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/startups' }),
  /* `image()` is Astro's content-collection image helper: it resolves the
   * frontmatter path relative to the markdown file and hands the template an
   * ImageMetadata, so the same astro:assets pipeline the hero uses applies
   * here. Optional everywhere — an entry without one renders no band. */
  schema: ({ image }) => z.object({
    name: z.string(),
    tagline: z.string(),
    /** Path under /public, e.g. /logos/aria.svg */
    logo: z.string(),
    /** Cohort year — also the sort key for "latest startups". */
    cohort: z.number().int(),
    sectors: z.array(z.string()).min(1),
    stage: z.enum(['Incubating', 'Pre-seed', 'Seed', 'Series A']),
    website: z.url().optional(),
    founders: z.array(z.object({ name: z.string(), role: z.string() })).default([]),
    publishDate: z.coerce.date(),
    draft: z.boolean().default(false),
    image: image().optional(),
    /** Empty alt is correct for a decorative band; write one when it carries meaning. */
    imageAlt: z.string().default(''),
  }),
});

const challenges = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/challenges' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    client: z.string(),
    sector: z.string(),
    summary: z.string(),
    /** Headline result, e.g. "68% faster triage" */
    outcome: z.string().optional(),
    /** `engagement` is a documented, client-approved case. `illustrative` is a
     * composite scenario: it renders labelled as such, with no year, so its
     * figures never read as achieved results. Required, so a new entry has to
     * make the choice. */
    status: z.enum(['engagement', 'illustrative']),
    year: z.number().int(),
    publishDate: z.coerce.date(),
    draft: z.boolean().default(false),
    image: image().optional(),
    imageAlt: z.string().default(''),
  }),
});

const requests = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/requests' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    /** Short label used in nav and cards, e.g. "Challenges" */
    shortTitle: z.string(),
    /** Lucide icon name, resolved by astro-icon */
    icon: z.string(),
    eyebrow: z.string(),
    /** One-liner used on the homepage overview card. */
    summary: z.string(),
    heroHeadline: z.string(),
    heroLead: z.string(),
    forWho: z.array(z.string()).min(1),
    youGet: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
    process: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
    formTitle: z.string(),
    formLead: z.string(),
    formFields: z.array(formField).min(1),
    /** Display order across homepage overview and nav. */
    order: z.number().int(),
    image: image().optional(),
    imageAlt: z.string().default(''),
  }),
});

export const collections = { startups, challenges, requests };
