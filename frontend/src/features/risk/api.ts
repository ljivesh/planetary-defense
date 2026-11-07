import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { apiGet } from '@/lib/api-client'
import { QUERY_STALE } from '@/lib/constants'
import { riskObjectSchema } from '@/features/risk/schemas'

export const riskListQuery = () =>
  queryOptions({
    queryKey: ['risk', 'list'] as const,
    queryFn: ({ signal }) => apiGet('/risk', z.array(riskObjectSchema), { signal }),
    staleTime: QUERY_STALE.long,
  })
