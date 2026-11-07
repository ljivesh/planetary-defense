import { SectionCard } from '@/components/common/section-card'
import { DefinitionGrid } from '@/features/objects/components/definition-grid'
import type { ObjectDetail } from '@/features/objects/schemas'
import { formatAu, formatDate, formatLd, formatNumber } from '@/lib/format'
import { jdToDate } from '@/lib/orbital'

const deg = (v: number) => `${formatNumber(v, 3)}°`

export function OrbitElementsCard({ object }: { object: ObjectDetail }) {
  const { elements: el, moidAu, conditionCode, observations, dataArcDays, firstObserved, lastObserved } = object.orbit
  return (
    <SectionCard
      title="Orbit"
      description={`Osculating elements at epoch ${formatDate(jdToDate(el.epoch))} (heliocentric ecliptic J2000)`}
    >
      <DefinitionGrid
        items={[
          { label: 'Semi-major axis (a)', value: formatAu(el.a) },
          { label: 'Eccentricity (e)', value: formatNumber(el.e, 4) },
          { label: 'Inclination (i)', value: deg(el.i) },
          { label: 'Perihelion (q)', value: formatAu(el.q) },
          { label: 'Aphelion (Q)', value: formatAu(el.ad) },
          { label: 'Period', value: el.periodDays ? `${formatNumber(el.periodDays / 365.25, 2)} yr` : '—' },
          { label: 'Ascending node (Ω)', value: deg(el.node) },
          { label: 'Arg. of perihelion (ω)', value: deg(el.peri) },
          {
            label: 'Earth MOID',
            hint: 'Minimum orbit intersection distance with Earth',
            value: moidAu === null ? '—' : `${formatAu(moidAu, 5)} · ${formatLd(moidAu)}`,
          },
          {
            label: 'Condition code',
            hint: '0 = very well determined orbit, 9 = highly uncertain',
            value: conditionCode || '—',
          },
          { label: 'Observations used', value: formatNumber(observations, 0) },
          {
            label: 'Data arc',
            value: dataArcDays ? `${formatNumber(dataArcDays, 0)} days (${firstObserved} → ${lastObserved})` : '—',
          },
        ]}
      />
    </SectionCard>
  )
}
