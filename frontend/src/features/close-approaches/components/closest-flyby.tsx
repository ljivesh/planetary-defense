import { Link } from 'react-router'

import { Skeleton } from '@/components/ui/skeleton'
import { DistanceStrip } from '@/features/close-approaches/components/distance-strip'
import { approachKey } from '@/features/close-approaches/lib'
import type { CloseApproach } from '@/features/close-approaches/schemas'
import { useNow } from '@/hooks/use-now'
import {
  displayName,
  formatCountdown,
  formatDateTime,
  formatDiameter,
  formatKm,
  formatLd,
  formatNumber,
  formatVelocity,
} from '@/lib/format'

interface ClosestFlybyProps {
  approach: CloseApproach | null
  all: CloseApproach[]
  windowDays: number
}

function Spec({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1.5 figure text-base text-ink">{value}</dd>
      {sub && <dd className="figure text-[11px] text-muted-ink">{sub}</dd>}
    </div>
  )
}

/** Overview hero: the closest upcoming flyby, a live countdown, and every approach on one distance line. */
export function ClosestFlyby({ approach, all, windowDays }: ClosestFlybyProps) {
  const now = useNow(1000)

  if (!approach) {
    return (
      <p className="py-10 text-body">
        No close approaches within 0.05 AU in the next {windowDays} days. The JPL feed may be catching up.
      </p>
    )
  }

  const name = displayName(approach.fullName)
  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <p className="display truncate text-5xl md:text-7xl">
            <Link
              to={`/objects/${encodeURIComponent(approach.designation)}`}
              className="decoration-hairline-strong decoration-1 underline-offset-8 hover:underline"
            >
              {name}
            </Link>
          </p>
          <p className="mt-5 figure text-2xl tracking-tight text-signal md:text-3xl" aria-live="off">
            {formatCountdown(approach.time, now)}
          </p>
          <p className="mt-2 max-w-xl text-sm text-body">
            Closest approach {formatDateTime(approach.time)}, passing {formatLd(approach.distanceAu)} (
            {formatKm(approach.distanceAu)}) from Earth.
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-12 gap-y-5 sm:grid-cols-4 lg:grid-cols-2">
          <Spec label="Miss distance" value={formatLd(approach.distanceAu)} sub={formatKm(approach.distanceAu)} />
          <Spec
            label="Size"
            value={formatDiameter(approach)}
            sub={approach.diameterM === null ? 'est. from H' : 'measured'}
          />
          <Spec label="Rel. velocity" value={formatVelocity(approach.velocityRelKms)} />
          <Spec label="Abs. magnitude" value={approach.h === null ? '—' : `H ${formatNumber(approach.h, 1)}`} />
        </dl>
      </div>
      <DistanceStrip data={all} highlightKey={approachKey(approach)} className="mt-12" />
    </div>
  )
}

export function ClosestFlybySkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="h-16 w-80 max-w-full" />
      <Skeleton className="mt-5 h-8 w-56" />
      <Skeleton className="mt-12 h-28 w-full" />
    </div>
  )
}
