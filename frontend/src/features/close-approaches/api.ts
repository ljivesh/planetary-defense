import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { apiGet } from '@/lib/api-client'
import { closeApproachSchema, type ApproachFilters } from '@/features/close-approaches/schemas'

export const closeApproachKeys = {
  all: ['close-approaches'] as const,
  list: (f: ApproachFilters) => [...closeApproachKeys.all, 'list', f] as const,
  object: (des: string) => [...closeApproachKeys.all, 'object', des] as const,
}

export const closeApproachesQuery = (filters: ApproachFilters) =>
  queryOptions({
    queryKey: closeApproachKeys.list(filters),
    queryFn: ({ signal }) =>
      apiGet('/close-approaches', z.array(closeApproachSchema), { params: { ...filters }, signal }),
  })

export const objectApproachesQuery = (des: string) =>
  queryOptions({
    queryKey: closeApproachKeys.object(des),
    queryFn: ({ signal }) =>
      apiGet(`/objects/${encodeURIComponent(des)}/close-approaches`, z.array(closeApproachSchema), { signal }),
  })
