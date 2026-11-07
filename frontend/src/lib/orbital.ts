/**
 * Two-body Keplerian orbit helpers.
 *
 * All positions are heliocentric ecliptic J2000 coordinates in AU, with
 * +z toward the north ecliptic pole. Accuracy is fine for visualization
 * (no planetary perturbations), not for ephemeris work.
 */
import { JD_UNIX_EPOCH } from '@/lib/constants'

export type Vec3 = [x: number, y: number, z: number]

export interface Elements {
  /** Semi-major axis, AU. */
  a: number
  /** Eccentricity. */
  e: number
  /** Inclination, degrees. */
  i: number
  /** Longitude of ascending node Ω, degrees. */
  node: number
  /** Argument of perihelion ω, degrees. */
  peri: number
  /** Mean anomaly at epoch, degrees. */
  m: number
  /** Epoch, Julian Date (TDB). */
  epoch: number
  /** Mean motion, degrees/day. Derived from `a` when omitted. */
  meanMotionDegPerDay?: number | null
}

/** Earth–Moon barycenter, J2000 mean elements (Standish, JPL). */
export const EARTH_ELEMENTS: Elements = {
  a: 1.00000261,
  e: 0.01671123,
  i: 0,
  node: 0,
  peri: 102.93768193,
  m: 100.46457166 - 102.93768193,
  epoch: 2_451_545.0,
}

/** Gaussian gravitational constant expressed as degrees/day for a = 1 AU. */
const K_DEG_PER_DAY = 0.9856076686

const rad = (deg: number) => (deg * Math.PI) / 180

export function dateToJd(date: Date): number {
  return date.getTime() / 86_400_000 + JD_UNIX_EPOCH
}

export function jdToDate(jd: number): Date {
  return new Date((jd - JD_UNIX_EPOCH) * 86_400_000)
}

/** Solves Kepler's equation M = E − e·sin(E) for E (radians) via Newton–Raphson. */
export function solveKepler(meanAnomalyRad: number, e: number, tolerance = 1e-12): number {
  const M = normalizeAngle(meanAnomalyRad)
  let E = e < 0.8 ? M : Math.PI
  for (let iter = 0; iter < 50; iter++) {
    const delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E))
    E -= delta
    if (Math.abs(delta) < tolerance) break
  }
  return E
}

function normalizeAngle(x: number): number {
  const twoPi = 2 * Math.PI
  return ((x % twoPi) + twoPi) % twoPi
}

/** Rotates a point in the orbital plane (perihelion on +x) into ecliptic coordinates. */
function toEcliptic(el: Elements, xp: number, yp: number): Vec3 {
  const O = rad(el.node)
  const w = rad(el.peri)
  const i = rad(el.i)
  const cO = Math.cos(O)
  const sO = Math.sin(O)
  const cw = Math.cos(w)
  const sw = Math.sin(w)
  const ci = Math.cos(i)
  const si = Math.sin(i)
  return [
    (cw * cO - sw * sO * ci) * xp + (-sw * cO - cw * sO * ci) * yp,
    (cw * sO + sw * cO * ci) * xp + (-sw * sO + cw * cO * ci) * yp,
    sw * si * xp + cw * si * yp,
  ]
}

function pointAtEccentricAnomaly(el: Elements, E: number): Vec3 {
  const xp = el.a * (Math.cos(E) - el.e)
  const yp = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E)
  return toEcliptic(el, xp, yp)
}

export function meanMotion(el: Elements): number {
  return el.meanMotionDegPerDay ?? K_DEG_PER_DAY / Math.pow(el.a, 1.5)
}

/** Heliocentric position (AU) at Julian Date `jd`. Only valid for elliptical orbits. */
export function positionAt(el: Elements, jd: number): Vec3 {
  const M = rad(el.m + meanMotion(el) * (jd - el.epoch))
  return pointAtEccentricAnomaly(el, solveKepler(M, el.e))
}

/**
 * Samples the full orbit ellipse. Sampling uniformly in eccentric anomaly
 * keeps the path smooth near perihelion for eccentric orbits.
 */
export function orbitPath(el: Elements, segments = 360): Vec3[] {
  if (!isElliptical(el)) return []
  const pts: Vec3[] = []
  for (let k = 0; k <= segments; k++) {
    pts.push(pointAtEccentricAnomaly(el, (k / segments) * 2 * Math.PI))
  }
  return pts
}

export function isElliptical(el: Elements): boolean {
  return el.e >= 0 && el.e < 1 && el.a > 0
}

export function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}
