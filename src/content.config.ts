/**
 * Content collections — Astro 5.
 *
 * Every page on this site is driven from Markdown. Adding a team member, a
 * sponsor, a gallery photo, an objective or a timeline phase is ONE new file;
 * no component ever needs editing. Ordering is content-controlled via `order`.
 *
 * Images are bound by FILENAME, not by a frontmatter path — see src/lib/images.ts.
 * `src/content/team/adrian-tabari.md` pairs with `src/assets/team/adrian-tabari.jpg`.
 * That is what makes dropping in a headshot a zero-code change.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const md = (dir: string) =>
  glob({ pattern: '**/*.md', base: `./src/content/${dir}` });

/**
 * Displayed values that are usually strings but are frequently written as bare
 * numbers in YAML (`value: 8`). Accepts either and normalises to a string, so a
 * perfectly reasonable edit doesn't fail the build. Still rejects null and
 * missing values.
 */
const displayValue = z.union([z.string(), z.number()]).transform(String);

const team = defineCollection({
  loader: md('team'),
  schema: z.object({
    name: z.string(),
    credentials: z.string(),
    affiliation: z.string(),
    position: z.string(),
    role: z.enum(['Mission Specialist', 'Ground Crew', 'Principal Investigator']),
    responsibilities: z.array(z.string()).min(1),
    order: z.number(),
    featured: z.boolean().default(false),
    links: z
      .object({
        linkedin: z.string().url().optional(),
        orcid: z.string().url().optional(),
        email: z.string().email().optional(),
      })
      .default({}),
    // No `photo` field by design. Drop a file into src/assets/team/ named after
    // this entry's filename and it is picked up on the next build.
  }),
});

const sponsors = defineCollection({
  loader: md('sponsors'),
  schema: z.object({
    name: z.string(),
    shortName: z.string().optional(),
    tier: z.enum(['programme', 'agency', 'supplier', 'foundation']),
    url: z.string().url().optional(),
    contribution: z.string(),
    /** false renders an explicit "Contribution to be confirmed" pill. */
    contributionConfirmed: z.boolean().default(true),
    /**
     * Hides the entry site-wide without deleting it. Use for sponsors that are
     * agreed but not yet announced, or that need to come off the site
     * temporarily. Delete the line to bring it back.
     */
    draft: z.boolean().default(false),
    /** Optical size correction — logos have wildly different visual weights. */
    logoScale: z.number().min(0.5).max(1.5).default(1),
    order: z.number(),
  }),
});

/**
 * Gallery metadata is an OPTIONAL sidecar. Photos are discovered by globbing
 * src/assets/gallery/, so a dropped-in image appears with no Markdown at all.
 * Adding `<same-name>.md` enriches it with a caption, category and span.
 */
const gallery = defineCollection({
  loader: md('gallery'),
  schema: z.object({
    alt: z.string().min(10),
    caption: z.string().optional(),
    category: z
      .enum(['prototype', 'fluidics', 'electronics', 'team', 'outreach', 'cad'])
      .default('prototype'),
    phase: z.string().optional(),
    date: z.coerce.date().optional(),
    span: z.enum(['1x1', '2x1', '1x2', '2x2']).default('1x1'),
    /* Optional, not defaulted. gallery.astro falls back to 999 so a photo with
       no stated order sorts to the end; a default of 0 sent it to the front
       instead, which is the opposite of what the page documents. */
    order: z.number().optional(),
  }),
});

const objectives = defineCollection({
  loader: md('objectives'),
  schema: z.object({
    number: z.number().int().min(1),
    title: z.string(),
    summary: z.string(),
    metrics: z
      .array(z.object({ label: z.string(), value: displayValue }))
      .default([]),
    icon: z.enum(['measure', 'flow', 'reliability', 'outreach']).default('measure'),
    order: z.number(),
  }),
});

const design = defineCollection({
  loader: md('design'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      kicker: z.string().optional(),
      summary: z.string(),
      hero: image().optional(),
      heroAlt: z.string().optional(),
      specs: z
        .array(
          z.object({
            label: z.string(),
            value: displayValue,
            note: z.string().optional(),
          }),
        )
        .default([]),
      stats: z
        .array(
          z.object({
            value: displayValue,
            label: z.string(),
            detail: z.string().optional(),
          }),
        )
        .default([]),
      order: z.number(),
    }),
});

const timeline = defineCollection({
  loader: md('timeline'),
  schema: z.object({
    phase: z.string(),
    title: z.string(),
    status: z.enum(['complete', 'active', 'upcoming']),
    detail: z.string().optional(),
    order: z.number(),
  }),
});

export const collections = { team, sponsors, gallery, objectives, design, timeline };
