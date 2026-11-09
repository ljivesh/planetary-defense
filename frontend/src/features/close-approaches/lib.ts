import type { CloseApproach } from '@/features/close-approaches/schemas'

/** Stable identity for one approach (an object can pass more than once). */
export const approachKey = (a: Pick<CloseApproach, 'designation' | 'time'>) => `${a.designation}@${a.time}`

/** The approach with the smallest miss distance, or null for an empty list. */
export function closestApproach<T extends Pick<CloseApproach, 'distanceAu'>>(items: readonly T[]): T | null {
  let best: T | null = null
  for (const a of items) if (!best || a.distanceAu < best.distanceAu) best = a
  return best
}
