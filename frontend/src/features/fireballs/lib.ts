import type { Fireball } from '@/features/fireballs/schemas'
import { formatNumber } from '@/lib/format'

/** "41.8°S, 173.1°W" or "Unknown location". */
export function formatLocation(f: Pick<Fireball, 'lat' | 'lon'>): string {
  if (f.lat === null || f.lon === null) return 'Unknown location'
  const lat = `${formatNumber(Math.abs(f.lat), 1)}°${f.lat >= 0 ? 'N' : 'S'}`
  const lon = `${formatNumber(Math.abs(f.lon), 1)}°${f.lon >= 0 ? 'E' : 'W'}`
  return `${lat}, ${lon}`
}

/** Hiroshima bomb yield (~15 kt) – a familiar reference for impact energy. */
export const HIROSHIMA_KT = 15
