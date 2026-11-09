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
import { AXIS_TICK, CHART_LABEL, decadeTicks, yearTicks } from '@/components/common/chart-theme'
import { formatLocation, HIROSHIMA_KT } from '@/features/fireballs/lib'
import type { Fireball } from '@/features/fireballs/schemas'
import { formatDateTime, formatEnergyKt, formatVelocity } from '@/lib/format'

interface Point {
  t: number
  kt: number
  item: Fireball
}

/** Impact energy of each fireball over time (log scale: energies span 4+ orders of magnitude). */
export function FireballEnergyChart({ data, height = 300 }: { data: Fireball[]; height?: number }) {
  const { points, xTicks, yTicks, yDomain } = useMemo(() => {
    const pts = data
      .filter((f) => f.impactEnergyKt > 0)
      .map<Point>((item) => ({ t: new Date(item.time).getTime(), kt: item.impactEnergyKt, item }))
    const kts = pts.map((p) => p.kt)
    const decades = kts.length ? decadeTicks(Math.min(...kts), Math.max(...kts)) : []
    return {
      points: pts,
      xTicks: yearTicks(pts.map((p) => p.t)),
      yTicks: decades,
      yDomain: decades.length ? [decades[0], decades[decades.length - 1]] : (['auto', 'auto'] as const),
    }
  }, [data])

  return (
    <figure>
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--hairline)" />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            ticks={xTicks}
            tickFormatter={(t: number) => format(t, 'yyyy')}
            tick={AXIS_TICK}
            stroke="var(--hairline-strong)"
            tickLine={false}
            tickMargin={8}
          />
          <YAxis
            dataKey="kt"
            type="number"
            scale="log"
            domain={yDomain}
            ticks={yTicks}
            tickFormatter={(v: number) => (v >= 1 ? v.toLocaleString('en-US') : String(v))}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={52}
          />
          <ReferenceLine
            y={HIROSHIMA_KT}
            stroke="var(--muted-ink)"
            strokeDasharray="3 3"
            label={{ ...CHART_LABEL, value: `HIROSHIMA · ${HIROSHIMA_KT} KT`, position: 'insideTopRight' }}
          />
          <Tooltip cursor={false} content={renderTooltip} />
          <Scatter
            data={points}
            fill="var(--chart-neutral)"
            fillOpacity={0.75}
            stroke="var(--canvas)"
            strokeWidth={2}
            isAnimationActive={false}
          />
        </ScatterChart>
      </ResponsiveContainer>
      <figcaption className="mt-3 text-xs text-muted-ink">
        Impact energy of {points.length} fireball events, log scale. The Hiroshima bomb (≈ {HIROSHIMA_KT} kt) is marked
        for scale.
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
        { label: 'Energy', value: formatEnergyKt(p.kt) },
        { label: 'Location', value: formatLocation(p.item) },
        { label: 'Velocity', value: formatVelocity(p.item.velocityKms) },
      ]}
    />
  )
}
