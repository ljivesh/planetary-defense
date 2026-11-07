import { QueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/api-client'
import { QUERY_STALE } from '@/lib/constants'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE.short,
      refetchOnWindowFocus: false,
      // Don't retry client errors (bad input, unknown object); retry upstream blips.
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
        return failureCount < 2
      },
    },
  },
})
