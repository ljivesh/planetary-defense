import { Link } from 'react-router'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { approachKey } from '@/features/close-approaches/lib'
import type { CloseApproach } from '@/features/close-approaches/schemas'
import { auToLd, displayName, formatDateTime, formatDiameter, formatLd, representativeDiameterM } from '@/lib/format'
import { cn } from '@/lib/utils'

interface DistanceStripProps {
  data: CloseApproach[]
  highlightKey?: string
  /** Right edge of the scale, in lunar distances. */
  maxLd?: number
  className?: string
}

const AXIS_TICKS = [2, 5, 10, 20]

/**
 * Miss distances on one line, Earth at the origin. A square-root scale keeps
 * Earth at zero (a log scale can't) while giving the space inside the Moon's
 * orbit room to breathe. Tick height grows with estimated size.
 */
export function DistanceStrip({ data, highlightKey, maxLd = 20, className }: DistanceStripProps) {
  const x = (ld: number) => `${Math.sqrt(Math.min(Math.max(ld, 0), maxLd) / maxLd) * 100}%`
  // Draw the highlighted tick last so it sits on top.
  const items = [...data].sort(
    (a, b) => Number(approachKey(a) === highlightKey) - Number(approachKey(b) === highlightKey),
  )
  const highlight = data.find((a) => approachKey(a) === highlightKey)

  return (
    <figure className={cn('select-none', className)}>
      <div className="relative mx-1 h-28">
        {/* Baseline + scale */}
        <div className="absolute inset-x-0 bottom-8 h-px bg-hairline-strong" />
        {AXIS_TICKS.filter((t) => t <= maxLd).map((t) => (
          <div
            key={t}
            className={cn(
              'absolute bottom-0 flex flex-col',
              t === maxLd ? '-translate-x-full items-end' : '-translate-x-1/2 items-center',
            )}
            style={{ left: x(t) }}
          >
            <div className="mb-1.5 h-1.5 w-px bg-hairline-strong" />
            <span className="micro block h-6 whitespace-nowrap text-muted-ink">{t} LD</span>
          </div>
        ))}

        {/* Earth and Moon */}
        <div className="absolute bottom-0 left-0 -translate-x-1/2">
          <div className="mx-auto mb-[3px] size-2.5 rounded-full bg-chart-earth" />
          <span className="micro block h-6 text-body">Earth</span>
        </div>
        <div className="absolute bottom-8 h-16 w-px bg-muted-ink/60" style={{ left: x(1) }}>
          <span className="micro absolute -top-1 left-1.5 text-muted-ink">Moon</span>
        </div>

        {/* Approaches */}
        {items.map((a) => {
          const isHighlight = approachKey(a) === highlightKey
          const d = representativeDiameterM(a) ?? 5
          const h = isHighlight ? 64 : 8 + 7 * Math.log10(Math.max(d, 1))
          return (
            <Tooltip key={approachKey(a)}>
              <TooltipTrigger asChild>
                <Link
                  to={`/objects/${encodeURIComponent(a.designation)}`}
                  aria-label={`${displayName(a.fullName)}, ${formatLd(a.distanceAu)}`}
                  className="group absolute bottom-8 flex w-2 -translate-x-1/2 justify-center"
                  style={{ left: x(auToLd(a.distanceAu)), height: h }}
                >
                  <span
                    className={cn(
                      'h-full transition-colors',
                      isHighlight ? 'w-0.5 bg-signal' : 'w-px bg-body/70 group-hover:bg-ink',
                    )}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent className="rounded-[2px] border border-hairline-strong bg-canvas px-3 py-2 text-xs text-ink">
                <div className="font-medium">{displayName(a.fullName)}</div>
                <div className="mt-1 figure text-body">
                  {formatLd(a.distanceAu)} · {formatDiameter(a)}
                </div>
                <div className="figure text-muted-ink">{formatDateTime(a.time)}</div>
              </TooltipContent>
            </Tooltip>
          )
        })}

        {highlight && (
          <span
            className="micro pointer-events-none absolute top-0 ml-2 whitespace-nowrap text-signal"
            style={{ left: x(auToLd(highlight.distanceAu)) }}
          >
            {displayName(highlight.fullName)} · {formatLd(highlight.distanceAu)}
          </span>
        )}
      </div>
      <figcaption className="mt-2 text-xs text-muted-ink">
        Miss distance of every approach in the window, Earth at left (square-root scale). Taller ticks are larger
        objects.
      </figcaption>
    </figure>
  )
}
