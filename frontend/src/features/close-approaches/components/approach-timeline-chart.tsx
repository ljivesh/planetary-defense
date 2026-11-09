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
import { AXIS_TICK, CHART_LABEL, dayTicks } from '@/components/common/chart-theme'
import type { CloseApproach } from '@/features/close-approaches/schemas'
import { approachKey } from '@/features/close-approaches/lib'
import {
  auToLd,
  displayName,
  formatDateTime,
  formatDiameter,
  formatLd,
  formatVelocity,
  representativeDiameterM,
} from '@/lib/format'
import { cn } from '@/lib/utils'

interface Point {
  t: number
  ld: number
  size: number
  item: CloseApproach
}

interface ApproachTimelineChartProps {
  data: CloseApproach[]
  /** `approachKey` of the approach to emphasise in signal (e.g. the closest). */
  highlightKey?: string
  isFetching?: boolean
  height?: number
}

/**
 * When will objects pass, and how close? Single series: x = date,
 * y = miss distance in lunar distances, dot area ∝ estimated size.
 * One approach can be emphasised in signal; everything else is neutral.
 */
export function ApproachTimelineChart({ data, highlightKey, isFetching, height = 300 }: ApproachTimelineChartProps) {
  const navigate = useNavigate()
  const { rest, highlight, ticks } = useMemo(() => {
    const points = data.map<Point>((item) => ({
      t: new Date(item.time).getTime(),
      ld: auToLd(item.distanceAu),
      // Log-compress sizes (1 m … 1 km) so small rocks stay visible next to big ones.
      size: Math.log10(Math.max(representativeDiameterM(item) ?? 5, 1)) + 1,
      item,
    }))
    return {
      rest: points.filter((p) => approachKey(p.item) !== highlightKey),
      highlight: points.filter((p) => approachKey(p.item) === highlightKey),
      ticks: dayTicks(points.map((p) => p.t)),
    }
  }, [data, highlightKey])

  const open = (d: { payload?: Point }) => {
    if (d.payload) navigate(`/objects/${encodeURIComponent(d.payload.item.designation)}`)
  }

  return (
    <figure className={cn('transition-opacity', isFetching && 'opacity-60')}>
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--hairline)" />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            ticks={ticks}
            tickFormatter={(t: number) => format(t, 'MMM d').toUpperCase()}
            tick={AXIS_TICK}
            stroke="var(--hairline-strong)"
            tickLine={false}
            tickMargin={8}
          />
          <YAxis
            dataKey="ld"
            type="number"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={44}
            label={{ ...CHART_LABEL, value: 'LD', position: 'insideTopLeft', offset: 0 }}
          />
          <ZAxis dataKey="size" type="number" range={[24, 360]} />
          <ReferenceLine
            y={1}
            stroke="var(--muted-ink)"
            strokeDasharray="3 3"
            label={{ ...CHART_LABEL, value: 'MOON · 1 LD', position: 'insideBottomRight' }}
          />
          <Tooltip cursor={false} content={renderTooltip} />
          <Scatter
            data={rest}
            fill="var(--chart-neutral)"
            fillOpacity={0.75}
            stroke="var(--canvas)"
            strokeWidth={2}
            cursor="pointer"
            isAnimationActive={false}
            onClick={open}
          />
          <Scatter
            data={highlight}
            fill="var(--chart-signal)"
            stroke="var(--canvas)"
            strokeWidth={2}
            cursor="pointer"
            isAnimationActive={false}
            onClick={open}
          />
        </ScatterChart>
      </ResponsiveContainer>
      <figcaption className="mt-3 text-xs text-muted-ink">
        {data.length} approaches by date and miss distance (1 LD = 384,400 km). Dot area scales with estimated diameter.
        Click a dot to open the object.
      </figcaption>
    </figure>
  )
}

function renderTooltip({ active, payload }: TooltipContentProps) {
  const p = active && payload?.[0] ? (payload[0].payload as Point) : null
  if (!p) return null
  return (
    <ChartTooltip
      title={displayName(p.item.fullName)}
      rows={[
        { label: 'Miss dist.', value: formatLd(p.item.distanceAu) },
        { label: 'Date (UTC)', value: formatDateTime(p.item.time) },
        { label: 'Size', value: formatDiameter(p.item) },
        { label: 'Velocity', value: formatVelocity(p.item.velocityRelKms) },
      ]}
    />
  )
}
