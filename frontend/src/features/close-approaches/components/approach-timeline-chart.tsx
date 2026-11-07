import { format } from 'date-fns'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'
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
  ZAxis,
} from 'recharts'

import { ChartTooltip } from '@/components/common/chart-tooltip'
import type { CloseApproach } from '@/features/close-approaches/schemas'
import { auToLd, formatDateTime, formatDiameter, formatLd, formatVelocity, representativeDiameterM } from '@/lib/format'
import { cn } from '@/lib/utils'

interface Point {
  t: number
  ld: number
  size: number
  item: CloseApproach
}

interface ApproachTimelineChartProps {
  data: CloseApproach[]
  isFetching?: boolean
  height?: number
}

const AXIS_TICK = { fill: 'var(--muted-foreground)', fontSize: 11 }

/**
 * When will objects pass, and how close? Single series: x = date,
 * y = miss distance in lunar distances, dot area ∝ estimated size.
 */
export function ApproachTimelineChart({ data, isFetching, height = 300 }: ApproachTimelineChartProps) {
  const navigate = useNavigate()
  const points = useMemo<Point[]>(
    () =>
      data.map((item) => ({
        t: new Date(item.time).getTime(),
        ld: auToLd(item.distanceAu),
        // Log-compress sizes (1 m … 1 km) so small rocks stay visible next to big ones.
        size: Math.log10(Math.max(representativeDiameterM(item) ?? 5, 1)) + 1,
        item,
      })),
    [data],
  )

  return (
    <figure className={cn('transition-opacity', isFetching && 'opacity-60')}>
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 8, right: 44, bottom: 4, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(t: number) => format(t, 'MMM d')}
            tick={AXIS_TICK}
            stroke="var(--chart-axis)"
            tickLine={false}
          />
          <YAxis
            dataKey="ld"
            type="number"
            tick={AXIS_TICK}
            stroke="var(--chart-axis)"
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v: number) => `${v}`}
            label={{ value: 'LD', position: 'insideTopLeft', offset: 0, fill: 'var(--muted-foreground)', fontSize: 11 }}
          />
          <ZAxis dataKey="size" type="number" range={[40, 420]} />
          <ReferenceLine
            y={1}
            stroke="var(--muted-foreground)"
            strokeDasharray="0"
            strokeOpacity={0.5}
            label={{ value: 'Moon', position: 'right', fill: 'var(--muted-foreground)', fontSize: 11 }}
          />
          <Tooltip cursor={false} content={renderTooltip} />
          <Scatter
            data={points}
            fill="var(--chart-1)"
            fillOpacity={0.85}
            stroke="var(--card)"
            strokeWidth={2}
            cursor="pointer"
            isAnimationActive={false}
            onClick={(d: { payload?: Point }) => {
              if (d.payload) navigate(`/objects/${encodeURIComponent(d.payload.item.designation)}`)
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
      <figcaption className="mt-2 text-xs text-muted-foreground">
        {data.length} approaches by date and miss distance in lunar distances (LD) · dot area scales with estimated
        diameter · 1 LD ≈ 384,400 km · click a dot for details
      </figcaption>
    </figure>
  )
}

function renderTooltip({ active, payload }: TooltipContentProps) {
  const p = active && payload?.[0] ? (payload[0].payload as Point) : null
  if (!p) return null
  return (
    <ChartTooltip
      title={p.item.fullName.replace(/^\((.*)\)$/, '$1')}
      rows={[
        { label: 'Miss distance', value: formatLd(p.item.distanceAu) },
        { label: 'Date', value: formatDateTime(p.item.time) },
        { label: 'Size', value: formatDiameter(p.item) },
        { label: 'Velocity', value: formatVelocity(p.item.velocityRelKms) },
      ]}
    />
  )
}
