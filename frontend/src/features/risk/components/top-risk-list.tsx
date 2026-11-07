import { Link } from 'react-router'

import { PalermoBadge } from '@/features/risk/components/hazard-badges'
import type { RiskObject } from '@/features/risk/schemas'
import { formatDiameter, formatOdds } from '@/lib/format'

/** Compact ranked list of the highest-risk objects for the overview page. */
export function TopRiskList({ items }: { items: RiskObject[] }) {
  return (
    <ol className="divide-y">
      {items.map((r, i) => (
        <li key={r.designation}>
          <Link
            to={`/objects/${encodeURIComponent(r.designation)}`}
            className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/50"
          >
            <span className="w-4 text-xs text-muted-foreground num">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{r.fullName.replace(/^\((.*)\)$/, '$1')}</div>
              <div className="text-xs text-muted-foreground">
                {formatOdds(r.impactProbability)} · {r.yearRange} · {formatDiameter(r)}
              </div>
            </div>
            <PalermoBadge value={r.palermoCumulative} />
          </Link>
        </li>
      ))}
    </ol>
  )
}
