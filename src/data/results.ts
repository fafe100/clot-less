/**
 * Flight-day facts for the stat rail on the results page.
 *
 * Result figures are deliberately not published here ahead of the paper; the
 * results page describes them in plain language instead.
 */
export const flightStats = [
  { value: '2', label: 'Flight days', detail: '1–2 September 2026' },
  { value: '11', label: 'Parabolas analysed', detail: 'Flight day 2 · 10 paired runs' },
  { value: '22 s', label: 'Microgravity window', detail: 'Per parabola, measured' },
  { value: '0.07 g', label: 'Mean residual gravity', detail: 'From onboard accelerometers' },
] as const;
