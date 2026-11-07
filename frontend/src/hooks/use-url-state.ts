import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'

type Defaults = Record<string, string>

/**
 * Keeps a flat record of string filters in the URL search params, so filtered
 * views are shareable and survive reloads. Values equal to their default are
 * omitted from the URL.
 */
export function useUrlState<T extends Defaults>(defaults: T) {
  const [searchParams, setSearchParams] = useSearchParams()

  const state = useMemo(() => {
    const out = { ...defaults }
    for (const key of Object.keys(defaults) as (keyof T)[]) {
      const v = searchParams.get(key as string)
      if (v !== null) out[key] = v as T[keyof T]
    }
    return out
  }, [searchParams, defaults])

  const setState = useCallback(
    (patch: Partial<T>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(patch)) {
            if (value === undefined || value === '' || value === defaults[key]) next.delete(key)
            else next.set(key, value)
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams, defaults],
  )

  const reset = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams])

  return [state, setState, reset] as const
}
