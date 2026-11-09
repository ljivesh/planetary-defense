import { EARTH_ELEMENTS, type Elements } from '@/lib/orbital'

/**
 * Mean J2000 orbital elements of the planets, from JPL's "Approximate
 * Positions of the Planets" (E. M. Standish, Table 1, valid 1800–2050).
 * Values are a (AU), e, I, L (mean longitude), ϖ (longitude of perihelion)
 * and Ω (ascending node), all in degrees.
 *
 * The secular rates are ignored: over the viewer's few-year window they move
 * the planets by far less than a marker's width.
 */
const STANDISH = {
  mercury: { a: 0.38709927, e: 0.20563593, I: 7.00497902, L: 252.2503235, varpi: 77.45779628, node: 48.33076593 },
  venus: { a: 0.72333566, e: 0.00677672, I: 3.39467605, L: 181.9790995, varpi: 131.60246718, node: 76.67984255 },
  mars: { a: 1.52371034, e: 0.0933941, I: 1.84969142, L: -4.55343205, varpi: -23.94362959, node: 49.55953891 },
  jupiter: { a: 5.202887, e: 0.04838624, I: 1.30439695, L: 34.39644051, varpi: 14.72847983, node: 100.47390909 },
} as const

const J2000 = 2_451_545.0

/** Standish (L, ϖ, Ω) → (ω = ϖ − Ω, M = L − ϖ). */
function fromStandish(p: (typeof STANDISH)[keyof typeof STANDISH]): Elements {
  return { a: p.a, e: p.e, i: p.I, node: p.node, peri: p.varpi - p.node, m: p.L - p.varpi, epoch: J2000 }
}

export type PlanetId = 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter'

export interface Planet {
  id: PlanetId
  name: string
  elements: Elements
}

export const PLANETS: Planet[] = [
  { id: 'mercury', name: 'Mercury', elements: fromStandish(STANDISH.mercury) },
  { id: 'venus', name: 'Venus', elements: fromStandish(STANDISH.venus) },
  { id: 'earth', name: 'Earth', elements: EARTH_ELEMENTS },
  { id: 'mars', name: 'Mars', elements: fromStandish(STANDISH.mars) },
  { id: 'jupiter', name: 'Jupiter', elements: fromStandish(STANDISH.jupiter) },
]

/** Planets worth drawing for an orbit reaching out to `aphelionAu`. */
export function planetsFor(aphelionAu: number): Planet[] {
  return PLANETS.filter((p) => p.id !== 'jupiter' || aphelionAu > 3.5)
}
