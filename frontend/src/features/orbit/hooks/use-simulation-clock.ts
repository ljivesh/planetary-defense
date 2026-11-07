import { useCallback, useEffect, useRef, useState } from 'react'

interface SimulationClockOptions {
  /** Simulated days per real second while playing. */
  daysPerSecond?: number
  /** Offset range in days, centered on today. */
  rangeDays?: number
}

/**
 * A day offset from "now" that can be scrubbed or played forward,
 * wrapping around at the end of the range.
 */
export function useSimulationClock({ daysPerSecond = 30, rangeDays = 730 }: SimulationClockOptions = {}) {
  const [dayOffset, setDayOffset] = useState(0)
  const [playing, setPlaying] = useState(false)
  const lastTs = useRef<number | null>(null)
  const rafId = useRef(0)

  useEffect(() => {
    if (!playing) return
    const tick = (ts: number) => {
      if (lastTs.current !== null) {
        const dt = (ts - lastTs.current) / 1000
        setDayOffset((d) => {
          const next = d + dt * daysPerSecond
          return next > rangeDays ? -rangeDays : next
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
  }, [playing, daysPerSecond, rangeDays])

  const toggle = useCallback(() => setPlaying((p) => !p), [])
  const reset = useCallback(() => {
    setPlaying(false)
    setDayOffset(0)
  }, [])

  return { dayOffset, setDayOffset, playing, toggle, reset, rangeDays }
}
