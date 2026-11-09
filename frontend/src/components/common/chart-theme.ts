/** Shared Recharts styling, per docs/DESIGN.md §6 (mono ticks, muted ink). */
export const AXIS_TICK = {
  fill: 'var(--muted-ink)',
  fontSize: 10,
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.06em',
}

/** Reference-line and axis-title labels. */
export const CHART_LABEL = {
  fill: 'var(--muted-ink)',
  fontSize: 10,
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.08em',
}

const DAY_MS = 86_400_000

/** About `count` evenly spaced, day-aligned ticks across a time span (ms). */
export function dayTicks(times: number[], count = 6): number[] {
  if (times.length === 0) return []
  const min = Math.min(...times)
  const max = Math.max(...times)
  const step = Math.max(1, Math.round((max - min) / DAY_MS / count)) * DAY_MS
  const out: number[] = []
  for (let t = Math.ceil(min / DAY_MS) * DAY_MS; t <= max; t += step) out.push(t)
  return out
}

/** 1 January ticks (UTC) every `step` years across a time span (ms). */
export function yearTicks(times: number[], step = 2): number[] {
  if (times.length === 0) return []
  const first = new Date(Math.min(...times)).getUTCFullYear() + 1
  const last = new Date(Math.max(...times)).getUTCFullYear()
  const out: number[] = []
  for (let y = first; y <= last; y += step) out.push(Date.UTC(y, 0, 1))
  return out
}

/** Powers of ten spanning [min, max]: log-axis ticks that read as 0.1, 1, 10, 100… */
export function decadeTicks(min: number, max: number): number[] {
  const out: number[] = []
  for (let e = Math.floor(Math.log10(min)); e <= Math.ceil(Math.log10(max)); e++) out.push(10 ** e)
  return out
}
