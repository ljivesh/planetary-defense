import type { ReactNode } from 'react'

export interface DefinitionItem {
  label: string
  /** Optional symbol shown after the label (e.g. "a", "Ω"). */
  symbol?: string
  value: ReactNode
  /** Muted trailing figure: uncertainty, alternate unit. */
  sub?: ReactNode
  hint?: string
}

/** Data-sheet definition list: label left, mono figure right, hairline rows. */
export function DefinitionGrid({ items }: { items: DefinitionItem[] }) {
  return (
    <dl className="border-t border-hairline">
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline justify-between gap-4 border-b border-hairline py-2.5">
          <dt className="text-[13px] text-body" title={item.hint}>
            {item.label}
            {item.symbol && <span className="ml-2 figure text-xs text-muted-ink">{item.symbol}</span>}
          </dt>
          <dd className="min-w-0 text-right figure text-[13px] text-ink">
            {item.value}
            {item.sub && <span className="ml-2 text-muted-ink">{item.sub}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}
