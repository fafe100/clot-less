/**
 * Deterministic monogram fallback for team members without a headshot.
 *
 * The hue is picked from a curated navy-to-blush ramp rather than generated
 * randomly, so a grid of monograms reads as a designed set instead of a bag of
 * arbitrary colours. Same name always yields the same tile.
 */

/** Sampled from the emblem — every stop sits in the patch's own colour family. */
const RAMP = [
  { from: '#16224F', to: '#0A143C' },
  { from: '#1D2A5C', to: '#101B47' },
  { from: '#2A2456', to: '#141A44' },
  { from: '#3A2450', to: '#181A46' },
  { from: '#4A2448', to: '#1C1A42' },
  { from: '#5A2440', to: '#201A40' },
] as const;

/** FNV-1a — small, fast, and stable across builds. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** "Dr. Matthew Turnock" → "MT"; "Adrian Tabari" → "AT". */
export function initials(name: string): string {
  const parts = name
    .replace(/\b(Dr|Prof|Mr|Ms|Mrs|Mx)\.?\s+/gi, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function monogramGradient(name: string): { from: string; to: string } {
  return RAMP[hash(name) % RAMP.length]!;
}
