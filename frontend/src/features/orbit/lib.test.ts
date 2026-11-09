import { describe, expect, it } from 'vitest'

import { apsides, dropLines, nextApproach, nodePositions, splitAtEcliptic, trailPath } from '@/features/orbit/lib'
import { PLANETS } from '@/features/orbit/planets'
import { distance, orbitPath, positionAt, type Elements } from '@/lib/orbital'

// Apophis-like orbit (SBDB, epoch 2026-Jun-03).
const APOPHIS: Elements = {
  a: 0.9223592206975018,
  e: 0.1911492279663492,
  i: 3.341,
  node: 203.8936514240762,
  peri: 126.68,
  m: 0,
  epoch: 2_461_200.5,
}

describe('planets', () => {
  it('places Mars at its J2000 heliocentric position', () => {
    const mars = PLANETS.find((p) => p.id === 'mars')!.elements
    // JPL Horizons, Mars heliocentric ecliptic J2000 at 2000-01-01 12:00 TDB.
    expect(distance(positionAt(mars, 2_451_545.0), [1.3907, -0.0134, -0.0345])).toBeLessThan(0.01)
  })
})

describe('orbit geometry', () => {
  it('splits a closed orbit into runs that meet on the ecliptic', () => {
    const { above, below } = splitAtEcliptic(orbitPath(APOPHIS, 360))
    expect(above).toHaveLength(1)
    expect(below).toHaveLength(1)
    for (const run of [...above, ...below]) {
      expect(run[0][2]).toBeCloseTo(0, 9)
      expect(run[run.length - 1][2]).toBeCloseTo(0, 9)
    }
    expect(above[0].every((p) => p[2] >= -1e-12)).toBe(true)
    expect(below[0].every((p) => p[2] <= 1e-12)).toBe(true)
  })

  it('keeps a flat orbit in a single run', () => {
    const { above, below } = splitAtEcliptic(orbitPath({ ...APOPHIS, i: 0 }, 64))
    expect(above).toHaveLength(1)
    expect(below).toHaveLength(0)
  })

  it('puts the nodes on the ecliptic and the apsides at q and Q', () => {
    const { ascending, descending } = nodePositions(APOPHIS)
    expect(ascending[2]).toBeCloseTo(0, 9)
    expect(descending[2]).toBeCloseTo(0, 9)
    // The ascending node lies along longitude Ω.
    expect(Math.atan2(ascending[1], ascending[0]) * (180 / Math.PI) + 360).toBeCloseTo(APOPHIS.node, 6)

    const { perihelion, aphelion } = apsides(APOPHIS)
    expect(distance(perihelion, [0, 0, 0])).toBeCloseTo(APOPHIS.a * (1 - APOPHIS.e), 9)
    expect(distance(aphelion, [0, 0, 0])).toBeCloseTo(APOPHIS.a * (1 + APOPHIS.e), 9)
  })

  it('builds drop-line segment pairs ending on the plane', () => {
    const segs = dropLines(orbitPath(APOPHIS, 72), 6)
    expect(segs.length % 2).toBe(0)
    for (let k = 1; k < segs.length; k += 2) expect(segs[k][2]).toBe(0)
  })

  it('ends the trail at the current position', () => {
    const jd = APOPHIS.epoch + 100
    const trail = trailPath(APOPHIS, jd, 60, 12)
    expect(trail).toHaveLength(13)
    expect(distance(trail[12], positionAt(APOPHIS, jd))).toBeLessThan(1e-12)
  })
})

describe('nextApproach', () => {
  it('returns the earliest approach after now', () => {
    const items = [{ time: '2029-04-13T21:46:00Z' }, { time: '2004-12-21T01:59:00Z' }, { time: '2036-03-27T00:00:00Z' }]
    expect(nextApproach(items, Date.parse('2026-11-07T00:00:00Z'))?.time).toBe('2029-04-13T21:46:00Z')
    expect(nextApproach(items, Date.parse('2040-01-01T00:00:00Z'))).toBeNull()
  })
})
