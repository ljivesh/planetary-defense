import type { Theme } from '@/app/theme-context'
import type { OrbitalElements } from '@/features/objects/schemas'
import { positionAt, positionAtTrueAnomaly, type Elements, type Vec3 } from '@/lib/orbital'

/** Scene units per AU. */
export const SCENE_SCALE = 10

/** Ecliptic (x, y, z-up), AU → three.js (x, y-up, z toward viewer), scene units. */
export function toScene([x, y, z]: Vec3): Vec3 {
  return [x * SCENE_SCALE, z * SCENE_SCALE, -y * SCENE_SCALE]
}

export function toElements(el: OrbitalElements): Elements {
  return {
    a: el.a,
    e: el.e,
    i: el.i,
    node: el.node,
    peri: el.peri,
    m: el.m,
    epoch: el.epoch,
    meanMotionDegPerDay: el.meanMotionDegPerDay,
  }
}

// ---------- geometry ----------

/**
 * Splits a closed orbit path (ecliptic AU) into runs above (z ≥ 0) and below
 * the ecliptic, inserting the exact plane crossings so runs meet seamlessly.
 */
export function splitAtEcliptic(path: Vec3[]): { above: Vec3[][]; below: Vec3[][] } {
  const runs: { above: boolean; pts: Vec3[] }[] = []
  if (path.length === 0) return { above: [], below: [] }

  let current = { above: path[0][2] >= 0, pts: [path[0]] }
  for (let k = 1; k < path.length; k++) {
    const p = path[k - 1]
    const q = path[k]
    const qAbove = q[2] >= 0
    if (qAbove !== current.above) {
      const t = p[2] / (p[2] - q[2])
      const c: Vec3 = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, 0]
      current.pts.push(c)
      runs.push(current)
      current = { above: qAbove, pts: [c] }
    }
    current.pts.push(q)
  }
  runs.push(current)

  // The path is closed: join the last run onto the first when they're on the same side.
  if (runs.length > 1 && runs[0].above === runs[runs.length - 1].above) {
    const last = runs.pop()!
    runs[0] = { above: last.above, pts: [...last.pts, ...runs[0].pts.slice(1)] }
  }
  return {
    above: runs.filter((r) => r.above).map((r) => r.pts),
    below: runs.filter((r) => !r.above).map((r) => r.pts),
  }
}

/** Vertical segments from every `step`-th path point down (or up) to the ecliptic. */
export function dropLines(path: Vec3[], step: number, minHeightAu = 0.002): Vec3[] {
  const segs: Vec3[] = []
  for (let k = 0; k < path.length - 1; k += step) {
    const [x, y, z] = path[k]
    if (Math.abs(z) < minHeightAu) continue
    segs.push([x, y, z], [x, y, 0])
  }
  return segs
}

/** Ascending (☊) and descending (☋) node positions: where the orbit crosses the ecliptic. */
export function nodePositions(el: Elements): { ascending: Vec3; descending: Vec3 } {
  return {
    ascending: positionAtTrueAnomaly(el, -el.peri),
    descending: positionAtTrueAnomaly(el, 180 - el.peri),
  }
}

/** Perihelion (q) and aphelion (Q) positions. */
export function apsides(el: Elements): { perihelion: Vec3; aphelion: Vec3 } {
  return { perihelion: positionAtTrueAnomaly(el, 0), aphelion: positionAtTrueAnomaly(el, 180) }
}

/** The body's path over the last `days` before `jd`, oldest first. */
export function trailPath(el: Elements, jd: number, days = 60, steps = 48): Vec3[] {
  return Array.from({ length: steps + 1 }, (_, k) => positionAt(el, jd - days + (days * k) / steps))
}

/** First approach after `now` (ms), or null. */
export function nextApproach<T extends { time: string }>(items: readonly T[], now: number): T | null {
  let best: T | null = null
  let bestT = Infinity
  for (const a of items) {
    const t = Date.parse(a.time)
    if (t > now && t < bestT) {
      best = a
      bestT = t
    }
  }
  return best
}

/** Reference-ring radii (AU) for a scene framing `extentAu`: 1 AU steps, at most 6. */
export function ringRadii(extentAu: number): number[] {
  const max = Math.min(Math.ceil(extentAu + 0.2), 6)
  return Array.from({ length: max }, (_, k) => k + 1)
}

// ---------- colours ----------

export interface SceneColors {
  surface: string
  sun: string
  glow: string
  earth: string
  /** Object orbit (validated chart-signal). */
  object: string
  /** Object's current position: the single bright signal mark. */
  objectMark: string
  planet: string
  ring: string
}

/** three.js can't read CSS variables, so scene colours mirror docs/DESIGN.md tokens per theme. */
export const SCENE_COLORS: Record<Theme, SceneColors> = {
  dark: {
    surface: '#111111',
    sun: '#fff4dc',
    glow: '#ffb224',
    earth: '#3f86dc',
    object: '#c78213',
    objectMark: '#ffb224',
    planet: '#4a4a4a',
    ring: '#202020',
  },
  light: {
    surface: '#f2f2f0',
    sun: '#f2a900',
    glow: '#f2a900',
    earth: '#2a6fc9',
    object: '#b45309',
    objectMark: '#b45309',
    planet: '#b5b5b1',
    ring: '#dfdfdc',
  },
}
