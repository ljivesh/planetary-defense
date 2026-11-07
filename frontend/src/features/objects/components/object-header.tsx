import { Badge } from '@/components/ui/badge'
import type { ObjectDetail } from '@/features/objects/schemas'

const KIND_LABEL: Record<string, string> = {
  an: 'Numbered asteroid',
  au: 'Unnumbered asteroid',
  cn: 'Numbered comet',
  cu: 'Unnumbered comet',
}

export function ObjectHeader({ object }: { object: ObjectDetail }) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{object.fullName}</h1>
        {object.pha && (
          <Badge variant="destructive" title="Potentially Hazardous Asteroid: MOID ≤ 0.05 AU and H ≤ 22">
            PHA
          </Badge>
        )}
        {object.neo && <Badge variant="secondary">NEO</Badge>}
        {object.orbitClass.name && <Badge variant="outline">{object.orbitClass.name}</Badge>}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {KIND_LABEL[object.kind] ?? 'Small body'} · SPK-ID {object.spkId} · orbit solution {object.orbit.solutionDate}
      </p>
    </div>
  )
}
