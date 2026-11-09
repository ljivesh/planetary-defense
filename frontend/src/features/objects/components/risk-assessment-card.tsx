import { PlainTable, Td, Th } from '@/components/common/plain-table'
import { Section } from '@/components/common/section'
import { DefinitionGrid } from '@/features/objects/components/definition-grid'
import type { RiskAssessment } from '@/features/objects/schemas'
import { PalermoMark, TorinoMark } from '@/features/risk/components/risk-marks'
import { formatCompact, formatNumber, formatOdds, formatProbability, formatSigned, formatVelocity } from '@/lib/format'

const MAX_IMPACTORS = 10

export function RiskAssessmentCard({ risk, index }: { risk: RiskAssessment | null; index: string }) {
  if (!risk) {
    return (
      <Section index={index} label="Impact risk · Sentry">
        <p className="text-base text-ink">Not on the Sentry risk list.</p>
        <p className="mt-1 max-w-lg text-sm text-body">
          No potential Earth impacts have been found for this object over the next century or more.
        </p>
      </Section>
    )
  }

  const impactors = [...risk.impactors]
    .sort((a, b) => b.impactProbability - a.impactProbability)
    .slice(0, MAX_IMPACTORS)

  return (
    <Section index={index} label="Impact risk · Sentry" note={`Computed ${risk.computedAt}.`}>
      <div className="mb-6 flex flex-wrap gap-x-8 gap-y-2">
        <PalermoMark value={risk.palermoCumulative} />
        <TorinoMark value={risk.torinoMax} />
      </div>
      <DefinitionGrid
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
        <div className="mt-8">
          <p className="eyebrow mb-2">
            Top virtual impactors{risk.impactors.length > MAX_IMPACTORS && ` · ${risk.impactors.length} total`}
          </p>
          <PlainTable>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th numeric>Probability</Th>
                <Th numeric>Palermo</Th>
                <Th numeric>Torino</Th>
              </tr>
            </thead>
            <tbody>
              {impactors.map((vi) => (
                <tr key={vi.date}>
                  <Td className="figure text-ink">{vi.date}</Td>
                  <Td numeric>{formatProbability(vi.impactProbability)}</Td>
                  <Td numeric className="text-body">
                    {formatSigned(vi.palermo)}
                  </Td>
                  <Td numeric className="text-body">
                    {vi.torino ?? '—'}
                  </Td>
                </tr>
              ))}
            </tbody>
          </PlainTable>
        </div>
      )}
    </Section>
  )
}
