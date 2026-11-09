import { Pause, Play } from 'lucide-react'
import { lazy, Suspense, useCallback, useMemo, useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { useObjectApproaches } from '@/features/close-approaches/hooks/use-close-approaches'
import type { ObjectDetail } from '@/features/objects/schemas'
import type { ViewMode, ViewRequest } from '@/features/orbit/components/orbit-scene'
import { useOrbitModel } from '@/features/orbit/hooks/use-orbit-model'
import { SPEEDS, useSimulationClock } from '@/features/orbit/hooks/use-simulation-clock'
import { nextApproach } from '@/features/orbit/lib'
import { useTheme } from '@/hooks/use-theme'
import { formatAu, formatLd, formatNumber } from '@/lib/format'
import { dateToJd } from '@/lib/orbital'
import { cn } from '@/lib/utils'

// three.js is heavy: load the canvas only when the viewer renders.
const OrbitScene = lazy(() => import('@/features/orbit/components/orbit-scene'))

const DAY_MS = 86_400_000
const MIN_RANGE_DAYS = 730
const MAX_RANGE_DAYS = 365 * 12
const isoDay = (d: Date | string) => new Date(d).toISOString().slice(0, 10)

function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
  format,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  format?: (v: T) => string
}) {
  return (
    <fieldset className="m-0 flex min-w-0 items-center border border-hairline-strong p-0">
      <legend className="sr-only">{label}</legend>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={o === value}
          onClick={() => onChange(o)}
          className={cn(
            'micro h-7 px-2.5 transition-colors',
            o === value ? 'bg-ink text-canvas' : 'text-body hover:text-ink',
          )}
        >
          {format ? format(o) : String(o)}
        </button>
      ))}
    </fieldset>
  )
}

function Reading({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0 py-3">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 truncate figure text-sm text-ink">
        {value}
        {sub && <span className="ml-2 text-muted-ink">{sub}</span>}
      </dd>
    </div>
  )
}

/** Interactive heliocentric orbit diagram with time controls and live readouts. */
export function OrbitViewer({ object }: { object: ObjectDetail }) {
  const { theme } = useTheme()
  const [today] = useState(() => Date.now())
  const approaches = useObjectApproaches(object.designation)
  const encounterApproach = useMemo(() => nextApproach(approaches.data ?? [], today), [approaches.data, today])
  const encounterOffset = encounterApproach ? (Date.parse(encounterApproach.time) - today) / DAY_MS : null
  const encounterInRange = encounterOffset !== null && encounterOffset < MAX_RANGE_DAYS - 30

  const clock = useSimulationClock({
    rangeDays: encounterInRange ? Math.max(MIN_RANGE_DAYS, Math.ceil(encounterOffset + 180)) : MIN_RANGE_DAYS,
  })
  const simDate = new Date(today + clock.dayOffset * DAY_MS)
  const model = useOrbitModel(object.orbit.elements, dateToJd(simDate), encounterApproach)

  const [view, setView] = useState<ViewRequest>({ mode: 'free', id: 0 })
  const [activeView, setActiveView] = useState<ViewMode>('free')
  const requestView = useCallback((mode: ViewMode) => {
    setView((v) => ({ mode, id: v.id + 1 }))
    setActiveView(mode)
  }, [])
  const onUserControl = useCallback(() => setActiveView('free'), [])

  const label = object.shortName || object.designation
  const encounterLabel = encounterApproach
    ? `${isoDay(encounterApproach.time)} · ${formatLd(encounterApproach.distanceAu)}`
    : null
  const pct = (offset: number) => `${((offset + clock.rangeDays) / (2 * clock.rangeDays)) * 100}%`
  const height = model.live.eclipticHeightAu

  return (
    <div>
      <div
        className="relative h-[400px] overflow-hidden border border-hairline bg-surface md:h-[600px]"
        onDoubleClick={() => requestView(activeView)}
      >
        {model.elliptical ? (
          <Suspense fallback={<Skeleton className="size-full rounded-none" />}>
            <OrbitScene
              theme={theme}
              model={model}
              objectLabel={label}
              encounterLabel={encounterLabel}
              view={view}
              onUserControl={onUserControl}
            />
          </Suspense>
        ) : (
          <p className="grid h-full place-items-center p-6 text-sm text-body">
            This object is on an open (hyperbolic) orbit, which the viewer doesn't draw.
          </p>
        )}

        {/* Overlays */}
        <div className="pointer-events-none absolute top-3 left-3 space-y-1">
          <p className="micro flex items-center gap-2 text-body">
            <span className="h-px w-5 bg-chart-signal" /> Above ecliptic
          </p>
          <p className="micro flex items-center gap-2 text-body">
            <span className="w-5 border-t border-dashed border-chart-signal/70" /> Below ecliptic
          </p>
          <p className="micro text-muted-ink">
            ◇ <span className="normal-case">q Q</span> perihelion / aphelion · ☊ ☋ nodes
          </p>
        </div>
        <div className="absolute top-3 right-3 bg-surface">
          <Segmented
            label="Camera view"
            options={['top', 'side', 'free'] as const}
            value={activeView}
            onChange={requestView}
          />
        </div>
        <p className="micro pointer-events-none absolute bottom-3 left-3 text-muted-ink max-sm:hidden">
          Drag to rotate · click, then scroll to zoom · double-click to reset
        </p>
      </div>

      {/* Time controls */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-hairline py-3">
        <button
          type="button"
          onClick={clock.toggle}
          aria-label={clock.playing ? 'Pause' : 'Play'}
          className="grid size-7 place-items-center border border-hairline-strong text-ink hover:border-ink"
        >
          {clock.playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
        </button>
        <button
          type="button"
          onClick={clock.reverse}
          aria-label={clock.direction === 1 ? 'Play backwards' : 'Play forwards'}
          className="micro h-7 w-14 border border-hairline-strong text-body hover:text-ink"
        >
          {clock.direction === 1 ? 'Fwd ▸' : '◂ Rev'}
        </button>
        <Segmented
          label="Playback speed"
          options={SPEEDS}
          value={clock.speed}
          onChange={clock.setSpeed}
          format={(s) => `${s} d/s`}
        />

        {/* Scrubber: native range input on top of a custom track, for keyboard and screen readers. */}
        <div className="relative h-7 min-w-48 flex-1">
          <div className="absolute inset-x-0 top-1/2 h-px bg-hairline-strong" />
          <div className="absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-muted-ink" style={{ left: pct(0) }} />
          {encounterInRange && encounterOffset !== null && (
            <div
              className="absolute top-1/2 h-4 w-px -translate-y-1/2 bg-signal"
              style={{ left: pct(encounterOffset) }}
            />
          )}
          <div
            className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 border border-ink bg-canvas"
            style={{ left: pct(clock.dayOffset) }}
          />
          <input
            type="range"
            min={-clock.rangeDays}
            max={clock.rangeDays}
            step={1}
            value={Math.round(clock.dayOffset)}
            onChange={(e) => clock.setDayOffset(Number(e.target.value))}
            aria-label="Simulation date"
            aria-valuetext={isoDay(simDate)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </div>

        <div className="flex items-center gap-4">
          <button type="button" onClick={clock.reset} className="eyebrow text-body hover:text-ink">
            Today
          </button>
          {encounterInRange && encounterOffset !== null && (
            <button
              type="button"
              onClick={() => {
                if (clock.playing) clock.toggle()
                clock.setDayOffset(encounterOffset)
              }}
              className="eyebrow text-signal hover:underline"
            >
              Jump to {isoDay(encounterApproach!.time)} →
            </button>
          )}
        </div>
      </div>

      {/* Live readouts */}
      <dl className="grid grid-cols-2 gap-x-6 md:grid-cols-4">
        <Reading
          label="Sim date (UTC)"
          value={isoDay(simDate)}
          sub={`${clock.dayOffset >= 0 ? '+' : '−'}${formatNumber(Math.abs(Math.round(clock.dayOffset)), 0)} d`}
        />
        <Reading
          label="From Earth"
          value={model.live.earthDistanceAu === null ? '—' : formatAu(model.live.earthDistanceAu, 3)}
          sub={model.live.earthDistanceAu === null ? undefined : formatLd(model.live.earthDistanceAu)}
        />
        <Reading
          label="From Sun"
          value={model.live.sunDistanceAu === null ? '—' : formatAu(model.live.sunDistanceAu, 3)}
        />
        <Reading
          label="Ecliptic height"
          value={height === null ? '—' : formatAu(Math.abs(height), 3)}
          sub={height === null ? undefined : height >= 0 ? 'north' : 'south'}
        />
      </dl>
    </div>
  )
}
