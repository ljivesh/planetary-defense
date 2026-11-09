import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SectionProps {
  /** Two-digit section index shown in the eyebrow, e.g. "02". */
  index?: string
  /** Mono eyebrow label. */
  label: string
  title?: ReactNode
  /** One line of context under the title. */
  note?: ReactNode
  /** Right-aligned text action, usually a <TextLink>. */
  action?: ReactNode
  children: ReactNode
  className?: string
}

/** A numbered, rule-separated block: the page's unit of structure (no card, no box). */
export function Section({ index, label, title, note, action, children, className }: SectionProps) {
  return (
    <section className={cn('min-w-0 border-t border-hairline-strong pt-4', className)}>
      <header className="mb-6 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="eyebrow">
            {index && <span className="text-ink">{index}</span>}
            {index && <span className="px-1.5">/</span>}
            {label}
          </p>
          {title && <h2 className="display mt-3 text-xl md:text-2xl">{title}</h2>}
          {note && <p className="mt-1.5 max-w-2xl text-sm text-body">{note}</p>}
        </div>
        {action && <div className="shrink-0 pt-px">{action}</div>}
      </header>
      {children}
    </section>
  )
}
