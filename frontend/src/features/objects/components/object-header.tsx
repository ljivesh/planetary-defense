import type { ObjectDetail } from '@/features/objects/schemas'

const KIND_LABEL: Record<string, string> = {
  an: 'Numbered asteroid',
  au: 'Unnumbered asteroid',
  cn: 'Numbered comet',
  cu: 'Unnumbered comet',
}

/** Object title block: name, classification as mono caps, catalogue meta line. */
export function ObjectHeader({ object }: { object: ObjectDetail }) {
  const tags = [
    object.pha && { text: 'PHA', title: 'Potentially Hazardous Asteroid: MOID ≤ 0.05 AU and H ≤ 22', strong: true },
    object.neo && { text: 'NEO', title: 'Near-Earth object' },
    object.orbitClass.name && { text: object.orbitClass.name, title: object.orbitClass.code },
  ].filter(Boolean) as { text: string; title: string; strong?: boolean }[]

  return (
    <header className="pt-10 pb-10 md:pt-14">
      <p className="eyebrow mb-4">
        {KIND_LABEL[object.kind] ?? 'Small body'} · SPK-ID {object.spkId}
      </p>
      <h1 className="display text-4xl break-words md:text-6xl">{object.shortName || object.designation}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-sm text-body">{object.fullName}</span>
        {tags.map((t) => (
          <span key={t.text} title={t.title} className={t.strong ? 'micro text-signal' : 'micro text-body'}>
            {t.text}
          </span>
        ))}
        <span className="micro text-muted-ink">Orbit solution {object.orbit.solutionDate}</span>
      </div>
    </header>
  )
}
