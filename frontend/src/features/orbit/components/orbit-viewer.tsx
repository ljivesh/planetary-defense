import { addDays } from 'date-fns'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { lazy, Suspense, useState } from 'react'

import { SectionCard } from '@/components/common/section-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { ObjectDetail } from '@/features/objects/schemas'
import { useOrbitModel } from '@/features/orbit/hooks/use-orbit-model'
import { useSimulationClock } from '@/features/orbit/hooks/use-simulation-clock'
import { SCENE_COLORS } from '@/features/orbit/lib'
import { useTheme } from '@/hooks/use-theme'
import { formatAu, formatDate, formatLd } from '@/lib/format'
import { dateToJd } from '@/lib/orbital'

// three.js is heavy – load the canvas only when the viewer renders.
const OrbitScene = lazy(() => import('@/features/orbit/components/orbit-scene'))

/** Interactive 3D orbit diagram with a time scrubber. */
export function OrbitViewer({ object }: { object: ObjectDetail }) {
  const { theme } = useTheme()
  const clock = useSimulationClock()
  const [today] = useState(() => new Date())
  const simDate = addDays(today, clock.dayOffset)
  const model = useOrbitModel(object.orbit.elements, dateToJd(simDate))
  const colors = SCENE_COLORS[theme]
  const label = object.shortName || object.designation

  return (
    <SectionCard
      title="Orbit viewer"
      description="Two-body approximation · drag to rotate, scroll to zoom"
      contentClassName="space-y-3"
    >
      <div className="relative h-[420px] overflow-hidden rounded-lg border bg-background">
        {model.elliptical ? (
          <Suspense fallback={<Skeleton className="size-full" />}>
            <OrbitScene
              theme={theme}
              objectLabel={label}
              paths={model.paths}
              earth={model.earth}
              object={model.object}
              extent={model.extent}
            />
          </Suspense>
        ) : (
          <p className="grid h-full place-items-center p-6 text-sm text-muted-foreground">
            This object is on an open (hyperbolic) orbit, which the viewer doesn't draw.
          </p>
        )}
        <Legend earthColor={colors.earth} objectColor={colors.object} objectLabel={label} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="icon-sm" variant="outline" onClick={clock.toggle} aria-label={clock.playing ? 'Pause' : 'Play'}>
          {clock.playing ? <Pause /> : <Play />}
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={clock.reset} aria-label="Back to today">
          <RotateCcw />
        </Button>
        <input
          type="range"
          min={-clock.rangeDays}
          max={clock.rangeDays}
          step={1}
          value={Math.round(clock.dayOffset)}
          onChange={(e) => clock.setDayOffset(Number(e.target.value))}
          aria-label="Simulation date"
          className="min-w-40 flex-1 accent-primary"
        />
        <div className="text-sm num">
          <span className="font-medium">{formatDate(simDate)}</span>
          {model.earthDistanceAu !== null && (
            <span className="text-muted-foreground">
              {' '}
              · {formatAu(model.earthDistanceAu, 3)} ({formatLd(model.earthDistanceAu)}) from Earth
            </span>
          )}
        </div>
      </div>
    </SectionCard>
  )
}

function Legend({
  earthColor,
  objectColor,
  objectLabel,
}: {
  earthColor: string
  objectColor: string
  objectLabel: string
}) {
  return (
    <div className="absolute top-3 left-3 space-y-1 rounded-md border bg-card/80 px-3 py-2 text-xs backdrop-blur">
      <LegendRow color={earthColor} label="Earth orbit" />
      <LegendRow color={objectColor} label={`${objectLabel} orbit`} />
    </div>
  )
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      <span>{label}</span>
    </div>
  )
}
