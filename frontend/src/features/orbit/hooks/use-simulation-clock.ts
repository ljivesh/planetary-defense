import { useCallback, useEffect, useRef, useState } from 'react'

/** Selectable playback rates, simulated days per real second. */
export const SPEEDS = [1, 10, 30] as const
export type Speed = (typeof SPEEDS)[number]

interface SimulationClockOptions {
  /** Scrubbable range in days on either side of today. */
  rangeDays?: number
}

/**
 * A day offset from "now" that can be scrubbed, or played forwards or
 * backwards at a chosen speed, wrapping around at the ends of the range.
 */
export function useSimulationClock({ rangeDays = 730 }: SimulationClockOptions = {}) {
  const [dayOffset, setDayOffsetState] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<Speed>(10)
  const [direction, setDirection] = useState<1 | -1>(1)
  const lastTs = useRef<number | null>(null)
  const rafId = useRef(0)

  useEffect(() => {
    if (!playing) return
    const rate = speed * direction
    const tick = (ts: number) => {
      if (lastTs.current !== null) {
        const dt = Math.min((ts - lastTs.current) / 1000, 0.1) // don't jump after a background tab
        setDayOffsetState((d) => {
          const next = d + dt * rate
          if (next > rangeDays) return -rangeDays
          if (next < -rangeDays) return rangeDays
          return next
        })
      }
      lastTs.current = ts
      rafId.current = requestAnimationFrame(tick)
    }
    rafId.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(rafId.current)
      lastTs.current = null
    }
  }, [playing, speed, direction, rangeDays])

  const setDayOffset = useCallback(
    (d: number) => setDayOffsetState(Math.max(-rangeDays, Math.min(rangeDays, d))),
    [rangeDays],
  )
  const toggle = useCallback(() => setPlaying((p) => !p), [])
  const reverse = useCallback(() => setDirection((d) => (d === 1 ? -1 : 1)), [])
  const reset = useCallback(() => {
    setPlaying(false)
    setDayOffsetState(0)
  }, [])

  return { dayOffset, setDayOffset, playing, toggle, reset, speed, setSpeed, direction, reverse, rangeDays }
}
