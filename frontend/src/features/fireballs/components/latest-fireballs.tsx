import { PlainTable, Td, Th } from '@/components/common/plain-table'
import { formatLocation } from '@/features/fireballs/lib'
import type { Fireball } from '@/features/fireballs/schemas'
import { formatDate, formatEnergyKt, formatRelative, formatVelocity } from '@/lib/format'

/** Compact table of the most recent fireballs for the overview page. */
export function LatestFireballs({ items }: { items: Fireball[] }) {
  return (
    <PlainTable>
      <thead>
        <tr>
          <Th>Date</Th>
          <Th>Location</Th>
          <Th numeric className="max-sm:hidden">
            Velocity
          </Th>
          <Th numeric>Energy</Th>
        </tr>
      </thead>
      <tbody>
        {items.map((f) => (
          <tr key={f.time} className="hover:bg-surface">
            <Td>
              <div className="figure text-ink">{formatDate(f.time)}</div>
              <div className="micro text-muted-ink">{formatRelative(f.time)}</div>
            </Td>
            <Td className="figure text-body">{formatLocation(f)}</Td>
            <Td numeric className="text-body max-sm:hidden">
              {formatVelocity(f.velocityKms)}
            </Td>
            <Td numeric className="text-ink">
              {formatEnergyKt(f.impactEnergyKt)}
            </Td>
          </tr>
        ))}
      </tbody>
    </PlainTable>
  )
}
