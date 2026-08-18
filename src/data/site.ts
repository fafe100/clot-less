/**
 * Site-wide singleton config. Nav order, metadata and contact details live
 * here so they are changed in one place.
 */
/** Every address shown in the footer. Add or remove a line here. */
const contacts = ['atabari@student.ubc.ca', 'fafe@student.ubc.ca'] as const;

export const site = {
  name: 'CLOT-LESS',
  team: 'Team CLOT-LESS',
  experiment: 'A Quantitative Analysis of Thrombolysis Kinetics in Microgravity',
  campaign: 'CAN-RGX 2025–26',
  institution: 'University of British Columbia',
  tagline: 'Thrombolysis has never been tested in microgravity.',
  description:
    'Team CLOT-LESS is flying the first in-vitro study of thrombolysis kinetics in reduced gravity on the Canadian Space Agency’s CAN-RGX parabolic flight campaign.',
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
  { value: '12', label: 'Parabolas', detail: 'Across two flight days' },
  { value: '20 s', label: 'Microgravity window', detail: 'Per parabola' },
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
