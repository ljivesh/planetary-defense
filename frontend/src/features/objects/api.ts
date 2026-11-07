import { queryOptions } from '@tanstack/react-query'

import { apiGet } from '@/lib/api-client'
import { QUERY_STALE } from '@/lib/constants'
import { objectDetailSchema } from '@/features/objects/schemas'

export const objectQuery = (des: string) =>
  queryOptions({
    queryKey: ['objects', des] as const,
    queryFn: ({ signal }) => apiGet(`/objects/${encodeURIComponent(des)}`, objectDetailSchema, { signal }),
    staleTime: QUERY_STALE.long,
  })
