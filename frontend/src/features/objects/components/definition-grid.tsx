import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface DefinitionItem {
  label: string
  value: ReactNode
  hint?: string
}

/** Two-column label/value grid for parameter cards. */
export function DefinitionGrid({ items, columns = 2 }: { items: DefinitionItem[]; columns?: 1 | 2 }) {
  return (
    <dl className={cn('grid grid-cols-1 gap-x-6 gap-y-3', columns === 2 && 'sm:grid-cols-2')}>
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline justify-between gap-3 border-b pb-2 last:border-0">
          <dt className="text-sm text-muted-foreground" title={item.hint}>
            {item.label}
          </dt>
          <dd className="text-right text-sm font-medium num">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
