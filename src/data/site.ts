/**
 * Site-wide singleton config. Nav order, metadata and contact details live
 * here so they are changed in one place.
 */
/** Every address shown in the footer. Add or remove a line here. */
const contacts = ['atabari@student.ubc.ca', 'fafe@student.ubc.ca'] as const;

export const site = {
  name: 'CLOT-LESS',
  team: 'Team CLOT-LESS',
  experiment: 'An Analysis of Thrombolysis Kinetics in Microgravity',
  campaign: 'CAN-RGX 2025–26',
  institution: 'University of British Columbia',
  tagline: 'A platform for hematologic research in zero gravity.',
  description:
    'Team CLOT-LESS built and flew an experimental platform for thrombolysis and other hematologic research in zero gravity on the CAN-RGX parabolic flight campaign, and presented its first results at the 77th International Astronautical Congress.',
  contacts,
  // Primary contact — the "Get in touch" call to action. Derived rather than
  // repeated, so the two can never drift apart.
  contact: contacts[0],
  // Google Search Console ownership token. Paste the value from the "HTML tag"
  // verification method here (the content="..." string), then verify in the
  // console. Leave empty to render no tag.
  googleSiteVerification: '',
} as const;

export const nav = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/results', label: 'Results' },
  { href: '/team', label: 'Team' },
  { href: '/design', label: 'Project Design' },
  { href: '/partners', label: 'Partners' },
  { href: '/gallery', label: 'Gallery' },
] as const;

/**
 * Home-page stat rail. Lives here rather than inside index.astro so it can be
 * updated without touching a page component. Values are written whole (unit
 * included) so they render identically to the design page's stats.
 */
export const homeStats = [
  { value: '20', label: 'Parabolas', detail: 'Across two flight days' },
  { value: '22 s', label: 'Microgravity window', detail: 'Per parabola, measured' },
  { value: '8', label: 'Microfluidic channels', detail: '4 drug, 4 saline control' },
  { value: '13.3 kg', label: 'Payload mass', detail: '70.5% margin' },
] as const;

/** Tier headings and ordering for the partners page. */
export const sponsorTiers = [
  {
    id: 'programme',
    label: 'Programme',
    blurb: 'The organisation and challenge that put a student payload on a parabolic flight.',
  },
  {
    id: 'agency',
    label: 'Agencies',
    blurb: 'The programme and flight infrastructure that make the campaign possible.',
  },
  {
    id: 'supplier',
    label: 'Suppliers',
    blurb: 'In-kind hardware and consumables contributed to the payload.',
  },
  {
    id: 'foundation',
    label: 'Foundations',
    blurb: 'Financial support for reagents and project costs.',
  },
] as const;
