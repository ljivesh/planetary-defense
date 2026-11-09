import { useEffect, useMemo, useRef, useState } from 'react'

import { ErrorState } from '@/components/common/error-state'
import { LoadingRows } from '@/components/common/loading-block'
import { PlainTable, Td, Th } from '@/components/common/plain-table'
import { Section } from '@/components/common/section'
import { useObjectApproaches } from '@/features/close-approaches/hooks/use-close-approaches'
import { formatDateTime, formatKm, formatLd, formatVelocity } from '@/lib/format'
import { cn } from '@/lib/utils'

/** Earth encounters within 0.2 AU, 1900–2200; past rows muted, the next one marked. */
export function ApproachHistoryCard({ designation, index }: { designation: string; index: string }) {
  const { data, isPending, isError, error, refetch } = useObjectApproaches(designation)

  const [now] = useState(() => Date.now())
  const nextIndex = useMemo(() => data?.findIndex((a) => new Date(a.time).getTime() > now) ?? -1, [data, now])

  // Open the list at the next encounter (with a little history above it), not at 1900.
  const scroller = useRef<HTMLDivElement>(null)
  const nextRow = useRef<HTMLTableRowElement>(null)
  useEffect(() => {
    const box = scroller.current
    const row = nextRow.current
    if (nextIndex >= 0 && box && row) box.scrollTop = Math.max(0, row.offsetTop - 3 * row.offsetHeight)
  }, [nextIndex])

  return (
    <Section index={index} label="Earth encounters" note="Every pass within 0.2 AU between 1900 and 2200.">
      {isPending ? (
        <LoadingRows rows={5} />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <p className="text-sm text-body">No encounters within 0.2 AU in this period.</p>
      ) : (
        <div ref={scroller} className="max-h-[28rem] overflow-auto">
          <PlainTable>
            <thead className="sticky top-0 bg-canvas">
              <tr>
                <Th>Date</Th>
                <Th numeric>Distance</Th>
                <Th numeric className="max-sm:hidden">
                  km
                </Th>
                <Th numeric className="max-sm:hidden">
                  Velocity
                </Th>
              </tr>
            </thead>
            <tbody>
              {data.map((a, i) => {
                const isPast = nextIndex === -1 || i < nextIndex
                const isNext = i === nextIndex
                return (
                  <tr
                    key={a.time}
                    ref={isNext ? nextRow : undefined}
                    className={cn(isPast ? 'text-muted-ink' : 'text-ink')}
                  >
                    <Td className="figure">
                      {formatDateTime(a.time)}
                      {isNext && <span className="micro ml-3 text-signal">Next</span>}
                    </Td>
                    <Td numeric>{formatLd(a.distanceAu)}</Td>
                    <Td numeric className="max-sm:hidden">
                      {formatKm(a.distanceAu)}
                    </Td>
                    <Td numeric className="max-sm:hidden">
                      {formatVelocity(a.velocityRelKms)}
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </PlainTable>
        </div>
      )}
    </Section>
  )
}
