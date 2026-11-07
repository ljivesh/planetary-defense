import { useQuery } from '@tanstack/react-query'

import { summaryQuery } from '@/features/summary/api'

/** Dashboard KPIs (next-30-day approaches, top risk, latest fireball). */
export function useSummary() {
  return useQuery(summaryQuery())
}
