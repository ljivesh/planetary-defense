import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { cn } from '@/lib/utils'

/** Mono uppercase text action ("VIEW ALL →"). Turns signal on hover. */
export function TextLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  return (
    <Link
      to={to}
      className={cn(
        'eyebrow inline-flex items-center gap-1.5 text-body transition-colors hover:text-signal',
        className,
      )}
    >
      {children}
      <span aria-hidden>→</span>
    </Link>
  )
}
