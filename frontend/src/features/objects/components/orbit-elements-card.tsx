import { Section } from '@/components/common/section'
import { DefinitionGrid } from '@/features/objects/components/definition-grid'
import type { ObjectDetail } from '@/features/objects/schemas'
import { formatAu, formatDate, formatLd, formatNumber } from '@/lib/format'
import { jdToDate } from '@/lib/orbital'

const deg = (v: number) => `${formatNumber(v, 3)}°`

export function OrbitElementsCard({ object, index }: { object: ObjectDetail; index: string }) {
  const { elements: el, moidAu, conditionCode, observations, dataArcDays, firstObserved, lastObserved } = object.orbit
  return (
    <Section
      index={index}
      label="Orbital elements"
      note={`Osculating, heliocentric ecliptic J2000, epoch ${formatDate(jdToDate(el.epoch))}.`}
    >
      <DefinitionGrid
        items={[
          { label: 'Semi-major axis', symbol: 'a', value: formatAu(el.a) },
          { label: 'Eccentricity', symbol: 'e', value: formatNumber(el.e, 4) },
          { label: 'Inclination', symbol: 'i', value: deg(el.i) },
          { label: 'Perihelion distance', symbol: 'q', value: formatAu(el.q) },
          { label: 'Aphelion distance', symbol: 'Q', value: formatAu(el.ad) },
          {
            label: 'Orbital period',
            symbol: 'P',
            value: el.periodDays ? `${formatNumber(el.periodDays / 365.25, 2)} yr` : '—',
            sub: el.periodDays ? `${formatNumber(el.periodDays, 0)} d` : undefined,
          },
          { label: 'Longitude of asc. node', symbol: 'Ω', value: deg(el.node) },
          { label: 'Argument of perihelion', symbol: 'ω', value: deg(el.peri) },
          {
            label: 'Earth MOID',
            hint: 'Minimum orbit intersection distance with Earth',
            value: moidAu === null ? '—' : formatAu(moidAu, 5),
            sub: moidAu === null ? undefined : formatLd(moidAu),
          },
          {
            label: 'Condition code',
            hint: '0 = very well determined orbit, 9 = highly uncertain',
            value: conditionCode || '—',
            sub: 'of 9',
          },
          { label: 'Observations used', value: formatNumber(observations, 0) },
          {
            label: 'Data arc',
            value: dataArcDays ? `${formatNumber(dataArcDays, 0)} d` : '—',
            sub: dataArcDays ? `${firstObserved} → ${lastObserved}` : undefined,
          },
        ]}
      />
    </Section>
  )
}
