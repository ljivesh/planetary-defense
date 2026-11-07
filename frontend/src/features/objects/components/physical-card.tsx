import { SectionCard } from '@/components/common/section-card'
import { DefinitionGrid } from '@/features/objects/components/definition-grid'
import type { ObjectDetail } from '@/features/objects/schemas'
import { formatDiameter } from '@/lib/format'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function PhysicalCard({ object }: { object: ObjectDetail }) {
  const items = [
    {
      label: object.diameterM === null ? 'Diameter (estimated from H)' : 'Diameter',
      value: formatDiameter(object),
    },
    ...object.physical
      .filter((p) => p.name !== 'diameter')
      .map((p) => ({
        label: capitalize(p.title),
        value: `${p.value}${p.units ? ` ${p.units}` : ''}${p.sigma ? ` ± ${p.sigma}` : ''}`,
      })),
  ]
  return (
    <SectionCard title="Physical properties" description="Measured parameters from the JPL Small-Body Database">
      <DefinitionGrid items={items} columns={1} />
    </SectionCard>
  )
}
