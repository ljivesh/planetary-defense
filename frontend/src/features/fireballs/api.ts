import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { apiGet } from '@/lib/api-client'
import { QUERY_STALE } from '@/lib/constants'
import { fireballSchema } from '@/features/fireballs/schemas'

export const fireballsQuery = (limit: number) =>
  queryOptions({
    queryKey: ['fireballs', limit] as const,
    queryFn: ({ signal }) => apiGet('/fireballs', z.array(fireballSchema), { params: { limit }, signal }),
    staleTime: QUERY_STALE.long,
  })
