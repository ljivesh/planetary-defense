import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { closeApproachesQuery, objectApproachesQuery } from '@/features/close-approaches/api'
import type { ApproachFilters } from '@/features/close-approaches/schemas'

/** Close approaches for a filter set; keeps the previous result while refetching. */
export function useCloseApproaches(filters: ApproachFilters) {
  return useQuery({ ...closeApproachesQuery(filters), placeholderData: keepPreviousData })
}

/** Historical and future close approaches of a single object. */
export function useObjectApproaches(des: string | undefined) {
  return useQuery({ ...objectApproachesQuery(des ?? ''), enabled: Boolean(des) })
}
