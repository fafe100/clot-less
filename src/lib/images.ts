/**
 * Filename-bound image resolution.
 *
 * `import.meta.glob(..., { eager: true })` is resolved at build time, so a file
 * dropped into one of these folders is picked up on the next build with no code
 * and no frontmatter edit. That is the whole modularity story for imagery.
 *
 * Binding rule: the image's filename (without extension) must match the
 * Markdown entry's filename.
 *     src/content/team/adrian-tabari.md  ←→  src/assets/team/adrian-tabari.jpg
 */
import type { ImageMetadata } from 'astro';

type GlobResult = Record<string, { default: ImageMetadata }>;

/** Key a glob result by filename stem, dropping path and extension. */
function byStem(map: GlobResult): Record<string, ImageMetadata> {
  return Object.fromEntries(
    Object.entries(map).map(([path, mod]) => [
      path.split('/').pop()!.replace(/\.[^.]+$/, ''),
      mod.default,
    ]),
  );
}

const teamGlob = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/team/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

const sponsorGlob = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/logos/*.{png,svg,jpg,jpeg,webp}',
  { eager: true },
);

const galleryGlob = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/gallery/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

const galleryThumbGlob = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/gallery/thumbs/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

const TEAM_PHOTOS = byStem(teamGlob);
const SPONSOR_LOGOS = byStem(sponsorGlob);
const GALLERY_THUMBS = byStem(galleryThumbGlob);

/** Every gallery photo on disk, keyed by filename stem. */
export const GALLERY_IMAGES = byStem(galleryGlob);

/**
 * Returns null when no headshot has been supplied, and the card falls back to a
 * monogram. Group photos sit in the same folder but can never collide: lookups
 * are only ever made with a team entry's id, and no entry is named `group-*`.
 */
export const getTeamPhoto = (id: string): ImageMetadata | null => TEAM_PHOTOS[id] ?? null;

export const getSponsorLogo = (id: string): ImageMetadata | null => SPONSOR_LOGOS[id] ?? null;

/** Falls back to the full-size image when no pre-made thumbnail exists. */
export const getGalleryThumb = (id: string): ImageMetadata | null =>
  GALLERY_THUMBS[id] ?? GALLERY_IMAGES[id] ?? null;

const designGlob = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/design/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);
const CONTENT_IMAGES = { ...designGlob, ...galleryGlob };

/** Content hot reload can temporarily return the raw Markdown image path.
 * Resolve that path through Vite imports so Image always receives metadata.
 * Normal image() schema results pass through unchanged.
 */
export function resolveContentImage(
  value: ImageMetadata | string | undefined,
): ImageMetadata | undefined {
  if (typeof value !== 'string') return value;
  const path = value.replace(/^\.\.\/\.\.\/assets\//, '/src/assets/');
  const image = CONTENT_IMAGES[path]?.default;
  if (!image) throw new Error(`Content image has no matching import: ${value}`);
  return image;
}
