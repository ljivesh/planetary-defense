import { Flame } from 'lucide-react'

import { formatLocation } from '@/features/fireballs/lib'
import type { Fireball } from '@/features/fireballs/schemas'
import { formatDate, formatEnergyKt, formatRelative } from '@/lib/format'

/** Compact list of the most recent fireballs for the overview page. */
export function LatestFireballs({ items }: { items: Fireball[] }) {
  return (
    <ul className="divide-y">
      {items.map((f) => (
        <li key={f.time} className="flex items-center gap-3 py-2.5">
          <Flame className="size-4 shrink-0 text-chart-2" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">{formatLocation(f)}</div>
            <div className="text-xs text-muted-foreground">
              {formatDate(f.time)} · {formatRelative(f.time)}
            </div>
          </div>
          <span className="text-sm font-semibold num">{formatEnergyKt(f.impactEnergyKt)}</span>
        </li>
      ))}
    </ul>
  )
}
