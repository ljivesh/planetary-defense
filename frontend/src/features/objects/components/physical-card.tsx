import { Section } from '@/components/common/section'
import { DefinitionGrid } from '@/features/objects/components/definition-grid'
import type { ObjectDetail } from '@/features/objects/schemas'
import { formatDiameter } from '@/lib/format'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function PhysicalCard({ object, index }: { object: ObjectDetail; index: string }) {
  const items = [
    {
      label: 'Diameter',
      value: formatDiameter(object),
      sub: object.diameterM === null ? 'est. from H' : undefined,
    },
    ...object.physical
      .filter((p) => p.name !== 'diameter')
      .map((p) => ({
        label: capitalize(p.title),
        value: `${p.value}${p.units ? ` ${p.units}` : ''}`,
        sub: p.sigma ? `± ${p.sigma}` : undefined,
      })),
  ]
  return (
    <Section index={index} label="Physical parameters" note="Measured values from the JPL Small-Body Database.">
      <DefinitionGrid items={items} />
    </Section>
  )
}
