import { useQuery } from '@tanstack/react-query'

import { fireballsQuery } from '@/features/fireballs/api'

/** Most recent fireball (bolide) events, newest first. */
export function useFireballs(limit = 50) {
  return useQuery(fireballsQuery(limit))
}
