import { describe, expect, it } from 'vitest'

import {
  EARTH_ELEMENTS,
  dateToJd,
  distance,
  jdToDate,
  orbitPath,
  positionAt,
  solveKepler,
  type Elements,
} from '@/lib/orbital'

describe('solveKepler', () => {
  it('satisfies M = E - e sin E', () => {
    for (const e of [0, 0.1, 0.5, 0.9, 0.99]) {
      for (const M of [0.1, 1, 2, 3, 5]) {
        const E = solveKepler(M, e)
        const back = E - e * Math.sin(E)
        expect(Math.abs((((back - M) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI))).toBeLessThan(1e-9)
      }
    }
  })
})

describe('julian dates', () => {
  it('round-trips J2000', () => {
    const j2000 = new Date(Date.UTC(2000, 0, 1, 12))
    expect(dateToJd(j2000)).toBeCloseTo(2_451_545.0, 6)
    expect(jdToDate(2_451_545.0).toISOString()).toBe(j2000.toISOString())
  })
})

describe('positions', () => {
  it('keeps Earth near 1 AU from the Sun', () => {
    const r = distance(positionAt(EARTH_ELEMENTS, dateToJd(new Date('2026-11-07T00:00:00Z'))), [0, 0, 0])
    expect(r).toBeGreaterThan(0.983)
    expect(r).toBeLessThan(1.017)
  })

  it('puts the body at perihelion distance q = a(1-e) when M = 0', () => {
    const el: Elements = { a: 0.9224, e: 0.1911, i: 3.34, node: 203.89, peri: 126.68, m: 0, epoch: 2_461_200.5 }
    const r = distance(positionAt(el, el.epoch), [0, 0, 0])
    expect(r).toBeCloseTo(el.a * (1 - el.e), 9)
  })

  it('samples a closed path and skips hyperbolic orbits', () => {
    const path = orbitPath(EARTH_ELEMENTS, 64)
    expect(path).toHaveLength(65)
    expect(distance(path[0], path[64])).toBeLessThan(1e-9)
    expect(orbitPath({ ...EARTH_ELEMENTS, e: 1.2 })).toEqual([])
  })
})
