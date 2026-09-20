/**
 * Regenerates the favicon set from public/favicon-256.png.
 *
 *     npm run favicons
 *
 * The 256px PNG is the text-free mission emblem exported from the team's
 * Photoshop master (OneDrive → Clot-Less → Favicon.png). Replace that file,
 * run this, and commit the public/ files together.
 *
 * Outputs
 *   public/favicon.ico          16, 32 and 48px frames, resampled here with
 *                               premultiplied alpha rather than left to the
 *                               browser's scaler, so the transparent surround
 *                               cannot fringe the edges dark.
 *   public/apple-touch-icon.png 180px and opaque: iOS paints transparent pixels
 *                               black and applies its own corner mask, so the
 *                               emblem sits at 82% on a tile of its own outer
 *                               navy and nothing gets clipped.
 *
 * public/site.webmanifest points at the 256 PNG directly and never changes.
 */
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const SRC = 'public/favicon-256.png';
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

const source = await readFile(SRC);
const { width, height } = await sharp(source).metadata();
if (width !== 256 || height !== 256) {
  throw new Error(`${SRC} must be 256×256, got ${width}×${height}`);
}

// Trim the transparent surround so the artwork fills each frame edge to edge;
// `contain` pads it back to a square before resampling.
const trimmed = await sharp(source).trim().png().toBuffer();
const frame = (size) =>
  sharp(trimmed).resize(size, size, { fit: 'contain', background: TRANSPARENT }).png().toBuffer();

// ---- favicon.ico ----------------------------------------------------------
// An ICONDIR header, one 16-byte directory entry per frame, then the frames
// themselves as PNG. PNG-in-ICO is decoded by every current browser.
const sizes = [16, 32, 48];
const frames = await Promise.all(sizes.map(frame));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // resource type: icon
header.writeUInt16LE(frames.length, 4);

let offset = 6 + 16 * frames.length;
const entries = frames.map((png, i) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(sizes[i], 0); // width  (a 0 here would mean 256)
  entry.writeUInt8(sizes[i], 1); // height
  entry.writeUInt8(0, 2); // no palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += png.length;
  return entry;
});
await writeFile('public/favicon.ico', Buffer.concat([header, ...entries, ...frames]));

// ---- apple-touch-icon.png -------------------------------------------------
// The tile colour is read off the emblem's outer band rather than hard-coded,
// so a re-coloured emblem stays seamless: walk down the centre column to the
// first fully opaque pixel and step a few pixels inside it.
const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const pixel = (x, y) => {
  const i = (y * info.width + x) * info.channels;
  return { r: data[i], g: data[i + 1], b: data[i + 2], alpha: data[i + 3] };
};
const column = info.width >> 1;
let y = 0;
while (y < info.height && pixel(column, y).alpha < 255) y += 1;
const band = pixel(column, Math.min(y + 3, info.height - 1));
const background = { r: band.r, g: band.g, b: band.b, alpha: 1 };

const TILE = 180;
const INNER = Math.round(TILE * 0.82);
// Two passes: sharp applies composite after flatten whatever the call order,
// so the alpha channel is dropped separately to leave a plain RGB file.
const composed = await sharp({ create: { width: TILE, height: TILE, channels: 4, background } })
  .composite([{ input: await frame(INNER), gravity: 'centre' }])
  .png()
  .toBuffer();
await sharp(composed).removeAlpha().png().toFile('public/apple-touch-icon.png');

const hex = [band.r, band.g, band.b].map((v) => v.toString(16).padStart(2, '0')).join('');
console.log(`favicons: favicon.ico (${sizes.join('/')}) and apple-touch-icon.png (${TILE}px on #${hex}) from ${SRC}`);
