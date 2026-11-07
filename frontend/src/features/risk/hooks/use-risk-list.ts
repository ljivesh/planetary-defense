import { useQuery } from '@tanstack/react-query'

import { riskListQuery } from '@/features/risk/api'

/** The full Sentry risk table, sorted by cumulative Palermo scale (desc). */
export function useRiskList() {
  return useQuery(riskListQuery())
}
