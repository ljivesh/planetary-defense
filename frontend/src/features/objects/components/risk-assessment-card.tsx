import { ShieldCheck } from 'lucide-react'

import { EmptyState } from '@/components/common/empty-state'
import { SectionCard } from '@/components/common/section-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DefinitionGrid } from '@/features/objects/components/definition-grid'
import type { RiskAssessment } from '@/features/objects/schemas'
import { PalermoBadge, TorinoBadge } from '@/features/risk/components/hazard-badges'
import { formatCompact, formatNumber, formatOdds, formatProbability, formatSigned, formatVelocity } from '@/lib/format'

const MAX_IMPACTORS = 10

export function RiskAssessmentCard({ risk }: { risk: RiskAssessment | null }) {
  if (!risk) {
    return (
      <SectionCard title="Impact risk" description="NASA/JPL Sentry assessment">
        <EmptyState
          icon={ShieldCheck}
          title="Not on the Sentry risk list"
          description="No potential Earth impacts have been found for this object in the next 100+ years."
        />
      </SectionCard>
    )
  }

  const impactors = [...risk.impactors]
    .sort((a, b) => b.impactProbability - a.impactProbability)
    .slice(0, MAX_IMPACTORS)

  return (
    <SectionCard title="Impact risk" description={`NASA/JPL Sentry assessment · computed ${risk.computedAt}`}>
      <div className="mb-4 flex flex-wrap gap-2">
        <PalermoBadge value={risk.palermoCumulative} />
        <TorinoBadge value={risk.torinoMax} />
      </div>
      <DefinitionGrid
        columns={1}
        items={[
          { label: 'Cumulative impact odds', value: formatOdds(risk.impactProbability) },
          { label: 'Potential impacts', value: formatNumber(risk.impactCount, 0) },
          { label: 'Impact energy', value: risk.energyMt === null ? '—' : `${formatCompact(risk.energyMt)} Mt` },
          { label: 'Impact velocity', value: formatVelocity(risk.velocityImpactKms) },
          { label: 'Estimated mass', value: risk.massKg === null ? '—' : `${formatCompact(risk.massKg)} kg` },
          { label: 'Method', value: risk.method || '—' },
        ]}
      />
      {impactors.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-medium">
            Top virtual impactors{risk.impactors.length > MAX_IMPACTORS && ` (of ${risk.impactors.length})`}
          </h3>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Probability</TableHead>
                  <TableHead className="text-right">Palermo</TableHead>
                  <TableHead className="text-right">Torino</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {impactors.map((vi) => (
                  <TableRow key={vi.date}>
                    <TableCell className="num">{vi.date}</TableCell>
                    <TableCell className="text-right num">{formatProbability(vi.impactProbability)}</TableCell>
                    <TableCell className="text-right num">{formatSigned(vi.palermo)}</TableCell>
                    <TableCell className="text-right num">{vi.torino ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </SectionCard>
  )
}
