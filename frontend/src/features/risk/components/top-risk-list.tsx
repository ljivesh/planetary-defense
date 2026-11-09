import { PlainTable, Td, Th } from '@/components/common/plain-table'
import { ObjectLink } from '@/features/close-approaches/components/object-link'
import { PalermoMark } from '@/features/risk/components/risk-marks'
import type { RiskObject } from '@/features/risk/schemas'
import { formatDiameter, formatOdds } from '@/lib/format'

/** Ranked table of the highest-risk objects for the overview page. */
export function TopRiskList({ items }: { items: RiskObject[] }) {
  return (
    <PlainTable>
      <thead>
        <tr>
          <Th className="w-8">#</Th>
          <Th>Object</Th>
          <Th>Palermo</Th>
          <Th numeric>Odds</Th>
          <Th numeric className="max-sm:hidden">
            Size
          </Th>
        </tr>
      </thead>
      <tbody>
        {items.map((r, i) => (
          <tr key={r.designation} className="hover:bg-surface">
            <Td className="figure text-muted-ink">{String(i + 1).padStart(2, '0')}</Td>
            <Td>
              <ObjectLink designation={r.designation} name={r.fullName} />
              <div className="figure text-[11px] text-muted-ink">{r.yearRange}</div>
            </Td>
            <Td>
              <PalermoMark value={r.palermoCumulative} />
            </Td>
            <Td numeric>{formatOdds(r.impactProbability)}</Td>
            <Td numeric className="text-body max-sm:hidden">
              {formatDiameter(r)}
            </Td>
          </tr>
        ))}
      </tbody>
    </PlainTable>
  )
}
