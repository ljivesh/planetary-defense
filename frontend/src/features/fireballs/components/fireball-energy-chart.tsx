import { format } from 'date-fns'
import { useMemo } from 'react'
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts'

import { ChartTooltip } from '@/components/common/chart-tooltip'
import { formatLocation, HIROSHIMA_KT } from '@/features/fireballs/lib'
import type { Fireball } from '@/features/fireballs/schemas'
import { formatDateTime, formatEnergyKt, formatVelocity } from '@/lib/format'

interface Point {
  t: number
  kt: number
  item: Fireball
}

const AXIS_TICK = { fill: 'var(--muted-foreground)', fontSize: 11 }

/** Impact energy of each fireball over time (log scale – energies span 4+ orders of magnitude). */
export function FireballEnergyChart({ data, height = 280 }: { data: Fireball[]; height?: number }) {
  const points = useMemo<Point[]>(
    () =>
      data
        .filter((f) => f.impactEnergyKt > 0)
        .map((item) => ({ t: new Date(item.time).getTime(), kt: item.impactEnergyKt, item })),
    [data],
  )

  return (
    <figure>
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 8, right: 72, bottom: 4, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(t: number) => format(t, 'MMM yyyy')}
            tick={AXIS_TICK}
            stroke="var(--chart-axis)"
            tickLine={false}
          />
          <YAxis
            dataKey="kt"
            type="number"
            scale="log"
            domain={['auto', 'auto']}
            allowDataOverflow
            tick={AXIS_TICK}
            stroke="var(--chart-axis)"
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v: number) => (v >= 1 ? `${v}` : v.toString())}
            label={{ value: 'kt', position: 'insideTopLeft', offset: 0, fill: 'var(--muted-foreground)', fontSize: 11 }}
          />
          <ReferenceLine
            y={HIROSHIMA_KT}
            stroke="var(--muted-foreground)"
            strokeOpacity={0.5}
            label={{ value: 'Hiroshima', position: 'right', fill: 'var(--muted-foreground)', fontSize: 11 }}
          />
          <Tooltip cursor={false} content={renderTooltip} />
          <Scatter
            data={points}
            fill="var(--chart-2)"
            fillOpacity={0.85}
            stroke="var(--card)"
            strokeWidth={2}
            isAnimationActive={false}
          />
        </ScatterChart>
      </ResponsiveContainer>
      <figcaption className="mt-2 text-xs text-muted-foreground">
        Impact energy of {points.length} fireball events over time · Hiroshima ≈ {HIROSHIMA_KT} kt for scale
      </figcaption>
    </figure>
  )
}

function renderTooltip({ active, payload }: TooltipContentProps) {
  const p = active && payload?.[0] ? (payload[0].payload as Point) : null
  if (!p) return null
  return (
    <ChartTooltip
      title={formatDateTime(p.item.time)}
      rows={[
        { label: 'Impact energy', value: formatEnergyKt(p.kt) },
        { label: 'Location', value: formatLocation(p.item) },
        { label: 'Velocity', value: formatVelocity(p.item.velocityKms) },
      ]}
    />
  )
}
