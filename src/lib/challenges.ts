/**
 * Labelling for the `challenges` collection.
 *
 * An illustrative challenge is a composite scenario, not a client result. Every
 * surface that shows a challenge goes through these helpers so the label can
 * never be dropped on one page and kept on another. Illustrative entries show
 * no year: a year would date an engagement that did not happen.
 */
import type { CollectionEntry } from 'astro:content';

type Challenge = CollectionEntry<'challenges'>['data'];

export const isIllustrative = (d: Challenge) => d.status === 'illustrative';

/** Eyebrow above a challenge title. */
export const challengeEyebrow = (d: Challenge) =>
  isIllustrative(d) ? `Illustrative example · ${d.sector}` : `${d.sector} · ${d.year}`;

/** Label for the headline figure in the facts rail. */
export const outcomeLabel = (d: Challenge) =>
  isIllustrative(d) ? 'Illustrative outcome' : 'Result';

/** RuledRow `index` cell: the year, or nothing for an illustrative entry. */
export const rowIndex = (d: Challenge) => (isIllustrative(d) ? undefined : String(d.year));

/** RuledRow `meta` cell. */
export const rowMeta = (d: Challenge) =>
  isIllustrative(d) ? `${d.sector} · Illustrative` : d.sector;
