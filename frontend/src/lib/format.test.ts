import { describe, expect, it } from 'vitest'

import {
  formatCountdown,
  formatDate,
  formatDateTime,
  auToLd,
  formatDiameter,
  formatEnergyKt,
  formatLd,
  formatOdds,
  representativeDiameterM,
  toIsoDate,
} from '@/lib/format'

describe('format helpers', () => {
  it('converts AU to lunar distances', () => {
    expect(auToLd(0.00256955529)).toBeCloseTo(1, 9)
    expect(formatLd(0.00582725465227592)).toBe('2.27 LD')
  })

  it('prefers measured diameter over estimates', () => {
    expect(formatDiameter({ diameterM: 340, estimatedDiameterM: { minM: 400, maxM: 900 } })).toBe('340 m')
    expect(formatDiameter({ diameterM: 1300, estimatedDiameterM: null })).toBe('1.3 km')
    expect(formatDiameter({ diameterM: null, estimatedDiameterM: { minM: 55.5, maxM: 124.2 } })).toBe('56 m – 124 m')
    expect(formatDiameter({ diameterM: null, estimatedDiameterM: null })).toBe('—')
  })

  it('uses the geometric mean of the estimate range as representative size', () => {
    expect(representativeDiameterM({ diameterM: null, estimatedDiameterM: { minM: 10, maxM: 1000 } })).toBeCloseTo(100)
  })

  it('formats impact odds and energy', () => {
    expect(formatOdds(0.0003401)).toBe('1 in 2,940')
    expect(formatOdds(0)).toBe('—')
    expect(formatEnergyKt(0.18)).toBe('0.18 kt')
    expect(formatEnergyKt(75_210)).toBe('75.2 Mt')
  })

  it('formats ISO dates in UTC', () => {
    expect(toIsoDate(new Date('2026-11-07T23:59:00Z'))).toBe('2026-11-07')
    // Late-evening UTC must not roll over into the local timezone's next day.
    expect(formatDate('2026-11-07T23:59:00Z')).toBe('Nov 7, 2026')
    expect(formatDateTime('2026-11-08T21:34:00Z')).toBe('Nov 8, 2026 21:34 UTC')
  })

  it('formats mission-clock countdowns', () => {
    const now = Date.parse('2026-11-07T05:12:00Z')
    expect(formatCountdown('2026-11-08T21:34:05Z', now)).toBe('T− 1d 16:22:05')
    expect(formatCountdown('2026-11-07T05:13:30Z', now)).toBe('T− 00:01:30')
    expect(formatCountdown('2026-11-07T04:12:00Z', now)).toBe('T+ 01:00:00')
  })
})
