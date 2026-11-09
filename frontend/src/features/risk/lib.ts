/**
 * Hazard scales.
 *
 * Torino (0–10) is the public-facing scale; Palermo is the technical,
 * logarithmic scale comparing a threat to the background impact risk:
 * < −2 no likely consequence, −2…0 merits monitoring, > 0 of concern.
 */
export type StatusLevel = 'good' | 'warning' | 'serious' | 'critical'

export function palermoLevel(ps: number): StatusLevel {
  if (ps >= 0) return 'critical'
  if (ps >= -2) return 'serious'
  if (ps >= -4) return 'warning'
  return 'good'
}

/** Short state word for a Palermo value (rendered as mono caps). */
export function palermoLabel(ps: number): string {
  switch (palermoLevel(ps)) {
    case 'critical':
      return 'Concern'
    case 'serious':
      return 'Monitor'
    case 'warning':
      return 'Low'
    default:
      return 'Negligible'
  }
}

export function torinoLevel(ts: number | null): StatusLevel {
  if (ts === null || ts <= 0) return 'good'
  if (ts === 1) return 'warning'
  if (ts <= 4) return 'serious'
  return 'critical'
}

export const TORINO_DESCRIPTIONS: Record<number, string> = {
  0: 'No hazard',
  1: 'Normal – routine discovery',
  2: 'Meriting attention by astronomers',
  3: 'Meriting attention by astronomers',
  4: 'Meriting attention by astronomers',
  5: 'Threatening',
  6: 'Threatening',
  7: 'Threatening',
  8: 'Certain collision – local damage',
  9: 'Certain collision – regional devastation',
  10: 'Certain collision – global catastrophe',
}
