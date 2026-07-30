# Team CLOT-LESS

Website for *A Quantitative Analysis of Thrombolysis Kinetics in Microgravity* —
CAN-RGX 2025–26, Canadian Space Agency.

Built with [Astro](https://astro.build). Every page's content lives in Markdown,
so updating the site during the campaign does not require touching any code.

---

## Running it

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:4321>. Edits to Markdown appear on save.

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Type-checks, then builds to `dist/` |
| `npm run preview` | Serves the built site exactly as it will deploy |

> **If a style change doesn't appear**, Vite has cached it. Stop the server and
> run `rm -rf node_modules/.vite .astro`, then `npm run dev`. This bites during
> heavy CSS editing.

---

## Updating the site — the only table you need

Everything is one file. Nothing else needs editing, ever.

| To do this | Add or edit this |
| --- | --- |
| Add a team member | `src/content/team/their-name.md` |
| Add their photo | `src/assets/team/their-name.jpg` — **filename must match the `.md`** |
| Add a sponsor | `src/content/sponsors/name.md` + `src/assets/logos/name.png` |
| Add a gallery photo | Drop it in `src/assets/gallery/` — it appears immediately |
| Caption a gallery photo | `src/content/gallery/same-filename.md` (optional) |
| Add a mission objective | `src/content/objectives/05-thing.md` |
| Add a design subsystem | `src/content/design/06-thing.md` |
| Update project status | `src/content/timeline/phase-N.md` — change `status:` |
| Reorder anything | Change the `order:` number |
| Change nav, contact email, home stats | `src/data/site.ts` |

### The filename rule

Images bind to content by **filename**, not by a path in the frontmatter:

```
src/content/team/adrian-tabari.md   ←→   src/assets/team/adrian-tabari.jpg
```

Any image extension works (`.jpg`, `.png`, `.webp`). Drop the file in, rebuild,
done — there is no `photo:` field to update, which is exactly the point.

**A member with no photo automatically gets a monogram tile** — their initials on
a gradient drawn from the emblem palette, in the same 4:5 box a photo would fill.
The grid stays even whether you have zero photos or seven. Drop a real headshot in
and it takes over with no other change.

### Gallery photos are drop-in

`src/assets/gallery/` is globbed at build time, so a new photo appears with no
Markdown at all. The matching `.md` file is an **optional** sidecar that adds a
caption, category and grid span. Without one, the photo still shows with a generic
alt description.

> The current captions were written from the photographs themselves and may
> misname a component here or there. Each is a one-line fix in its `.md`.

---

## Content model

Frontmatter is validated on every build ([Zod](https://zod.dev) schemas in
`src/content.config.ts`). A typo fails the build with the exact file and field
rather than silently producing a broken page.

Two YAML gotchas worth knowing:

- **Quote any value containing a colon.** `caption: 24 V: terminal blocks` breaks;
  `caption: "24 V: terminal blocks"` is fine.
- **Bare numbers are fine** for spec and stat values — `value: 8` and
  `value: "8"` both work.

Scientific notation is typed as real Unicode: `ΔP`, `µ-Slide`, `T₂₅`, `37 °C`,
`≤`, `±`, `×`. Paste the character directly.

---

## Design system

### Colours come from the emblem

Every token derives from colours sampled out of the mission patch — deep navy
`#0A143C`, venous maroon `#6E1414`, arterial red `#FA3C46`, blush `#FABEB4`,
off-white `#FAFAFA`. Tokens live in `src/styles/tokens.css`. Change them there and
the whole site follows.

### The red usage law

**`--signal` (#FA3C46) is not the interactive colour. `--accent` (blush) is.**

Saturated red on deep navy sits at nearly opposite hue and similar luminance, so
edges shimmer, and red carries a hard-wired "error" meaning that reads wrong on a
button. Blush measures 11.11:1, stays inside the emblem's own colour family, and
reads warm rather than alarming.

| Colour | Use it for | Never use it for |
| --- | --- | --- |
| `--accent` blush | Links, hovers, focus rings, eyebrows, primary buttons | — |
| `--signal` red | The emblem, active nav dot, hairlines ≤2px, data strokes | Body text, link text, filled areas |
| `--signal-maroon` | Large red areas — section washes, the safety panel | Small text |

### The blur budget

`backdrop-filter` is expensive: each layer costs a full GPU resample every frame.
Blurring a *flat* navy section produces a flat navy result — identical to a plain
fill, for a real cost.

So `.glass` gives the fill, specular ring and shadows with **no** blur, and
`.glass--blur` is opt-in on exactly three elements:

1. The nav pill — content scrolls beneath it, so blur is the entire point
2. The lightbox backdrop — static, one at a time, over a photo
3. The mobile menu sheet — modal, mutually exclusive with the lightbox

**Do not add a fourth without checking the DevTools Layers panel.** Putting
`--blur` on a card grid is the single easiest way to wreck scroll performance.

On **iOS** the nav drops real blur (opaque fill instead), because iOS Safari
repaints a fixed blurred element on every scroll frame. This is scoped to iOS
only via `@supports (-webkit-touch-callout: none)` — Android and desktop
composite fixed `backdrop-filter` fine and keep the glass look.

### Text over photos

Text never sits on `backdrop-filter` alone. The only place text overlays an image
is the gallery caption, which rides its own gradient scrim reaching 0.92 alpha at
the baseline — so contrast holds no matter how bright the photo behind it is. The
lightbox caption avoids the problem entirely by sitting *outside* the image on an
opaque surface.

### Sponsor logos sit on a light plate

Several partner marks are black or dark-grey artwork. Rendered straight onto the
navy field they are effectively invisible — CSA, NRC-CNRC and Royal Columbian all
disappear. The light plate keeps every logo in its own brand colours and
guarantees contrast. **Don't remove it.**

---

## Accessibility

Built in, and worth not regressing:

- Every text/background pair meets WCAG AA; body copy is AAA. Measured, not
  estimated: primary 17.08:1, secondary 9.86:1, tertiary 5.71:1, and 4.89:1 in
  the worst case (tertiary on a panel over a bright photo)
- There is deliberately no text tier dimmer than `--text-tertiary`. One existed
  and measured 3.10:1 — below AA at every size it was used. Anything dim enough
  to read as a fourth step fails; anything that passes is indistinguishable from
  tertiary, so the ramp stops
- Full keyboard navigation; the lightbox uses a native `<dialog>` for real focus
  trapping, and focus returns to the thumbnail that opened it
- `prefers-reduced-motion` disables all animation
- `prefers-reduced-transparency` is honoured **and** there is a manual
  "Reduce transparency" toggle in the footer — the media query has limited
  browser support, so the toggle is what actually makes this work for most people
- Works with JavaScript disabled **and when JavaScript breaks**. The reveal
  animation's hidden state is gated behind a class an inline script adds, and the
  same script arms a 2s failsafe that removes it again. If the module bundle
  never loads — a partial deploy, a blocked request, a throw in earlier init —
  the page reveals itself instead of sitting blank forever
- The mobile menu marks the page behind it `inert` while open, so keyboard and
  screen-reader users can't tab into content hidden under the sheet
- Windows High Contrast mode supported via `forced-colors`

### Team bios contain no gendered pronouns

Pronouns have never been stated for any team member, so bios are written using the
name, the role, or a restructured sentence. **Please keep it that way** when
editing — a wrong guess misgenders a real person.

---

## Deploying

Configured for **https://clotless.ca**.

**Netlify / Cloudflare Pages / Vercel** — build command `npm run build`,
publish directory `dist`. Nothing else to change.

### The two domains

`clotless.ca` is canonical. `canrgx.ca` is held by the team but 301-redirects to
it via `public/_redirects`, so the two never compete as separate copies of the
same site in search results — and nobody landing on `canrgx.ca` mistakes this
for SEDS-Canada's official programme site.

Add both domains in the host's dashboard; the redirect file handles the rest.

### Moving domains later

Change `site` in `astro.config.mjs`. That single value drives every canonical
tag, Open Graph URL and sitemap entry.

If it ever lands on a project-path URL (`username.github.io/repo/`), also set
`base: '/repo/'`. Because every internal link goes through `link()` in
`src/lib/link.ts`, that is the whole change — there are no hardcoded paths.

### Social preview

`public/og-card.png` (1200x630) is what unfurls in Slack, iMessage, WhatsApp and
email. Regenerate it if the experiment title or emblem changes. After deploying,
validate with **opengraph.xyz** or Slack's own unfurl — caches are aggressive, so
test before sending the link to a sponsor.

---

## Project structure

```
src/
├── content.config.ts    Zod schemas for all six collections
├── content/             ← the site's content; edit these
│   ├── team/            7 members
│   ├── sponsors/        6 partners
│   ├── gallery/         optional photo metadata
│   ├── objectives/      4 mission objectives
│   ├── design/          overview + 5 subsystems
│   └── timeline/        7 project phases
├── assets/              ← images; optimised at build time
│   ├── team/            headshots (filename = content filename)
│   ├── logos/           sponsor marks
│   ├── gallery/         progress photos + thumbs/
│   ├── design/          CAD renders
│   └── brand/           the emblem
├── styles/
│   ├── tokens.css       every design value
│   ├── glass.css        the glass recipe + fallbacks
│   ├── typography.css   type scale
│   ├── motion.css       reveals + reduced-motion contract
│   └── global.css       imports the above, plus layout primitives
├── components/          presentational; rarely need editing
├── layouts/             page shells
├── lib/                 image binding, monograms, BASE_URL-safe links
├── scripts/             nav, reveals, lightbox, transparency toggle
└── pages/               the six routes
```

---

## Notes on the source material

- The thrombolytic agent is **tenecteplase (TNKase)**. `TEDP_RevB` says alteplase
  throughout and is out of date; the CAN-RGX deck and the Royal Columbian funding
  both confirm tenecteplase. Any figure lifted from Rev B that is drug-specific
  (notably the 1 mg/mL concentration) should be re-confirmed before publishing.
- Only **confirmed** sponsors appear. Pending approaches are deliberately not
  listed — publicly naming a company that hasn't agreed to anything reads badly to
  the very people being asked.
- Individual `@student.ubc.ca` addresses from the flight manifest are not
  published; the site uses one team contact, set in `src/data/site.ts`.
- Gallery photos had EXIF stripped during processing — the originals carried GPS
  coordinates and device identifiers.
