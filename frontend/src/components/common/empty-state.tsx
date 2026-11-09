import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface EmptyStateProps {
  /** Mono eyebrow above the title, e.g. "No data". */
  label?: string
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}

/** Text-first empty state: no illustration, just what happened and what to do. */
export function EmptyState({ label = 'No data', title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('py-8', className)}>
      <p className="eyebrow">{label}</p>
      <p className="mt-2 text-base text-ink">{title}</p>
      {description && <p className="mt-1 max-w-lg text-sm text-body">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
