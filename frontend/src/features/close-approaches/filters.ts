import { addDays } from 'date-fns'

import type { FilterOption } from '@/components/common/filter-select'
import type { ApproachFilters } from '@/features/close-approaches/schemas'
import { toIsoDate } from '@/lib/format'

/** URL-serialisable filter state for the close-approach views. */
export const APPROACH_FILTER_DEFAULTS = {
  window: '60',
  dist: '0.05',
  minSize: '0',
}

export type ApproachFilterState = typeof APPROACH_FILTER_DEFAULTS

export const WINDOW_OPTIONS: FilterOption[] = [
  { value: '7', label: 'Next 7 days' },
  { value: '30', label: 'Next 30 days' },
  { value: '60', label: 'Next 60 days' },
  { value: '180', label: 'Next 6 months' },
  { value: '365', label: 'Next 12 months' },
]

export const DISTANCE_OPTIONS: FilterOption[] = [
  { value: '0.00257', label: 'Within 1 LD' },
  { value: '0.0129', label: 'Within 5 LD' },
  { value: '0.05', label: 'Within 0.05 AU' },
  { value: '0.1', label: 'Within 0.1 AU' },
  { value: '0.2', label: 'Within 0.2 AU' },
]

export const SIZE_OPTIONS: FilterOption[] = [
  { value: '0', label: 'Any size' },
  { value: '10', label: '≥ 10 m' },
  { value: '50', label: '≥ 50 m' },
  { value: '140', label: '≥ 140 m' },
  { value: '1000', label: '≥ 1 km' },
]

/** Converts URL filter state into API query params. */
export function toApproachQuery(state: ApproachFilterState, now = new Date()): ApproachFilters {
  const days = Number(state.window) || 60
  return {
    from: toIsoDate(now),
    to: toIsoDate(addDays(now, days)),
    maxDistAu: Number(state.dist) || 0.05,
    minDiameterM: Number(state.minSize) || undefined,
  }
}
