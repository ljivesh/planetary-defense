import { useQuery } from '@tanstack/react-query'

import { objectQuery } from '@/features/objects/api'

/** Full SBDB + Sentry profile of one small body. */
export function useObject(des: string | undefined) {
  return useQuery({ ...objectQuery(des ?? ''), enabled: Boolean(des) })
}
