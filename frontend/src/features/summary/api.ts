import { queryOptions } from '@tanstack/react-query'

import { apiGet } from '@/lib/api-client'
import { summarySchema } from '@/features/summary/schemas'

export const summaryQuery = () =>
  queryOptions({
    queryKey: ['summary'] as const,
    queryFn: ({ signal }) => apiGet('/summary', summarySchema, { signal }),
  })
