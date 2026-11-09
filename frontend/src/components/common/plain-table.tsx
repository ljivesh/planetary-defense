import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

/**
 * Static data-sheet table for short lists (no sorting or paging): same look
 * as DataTable. Use `numeric` on cells holding figures.
 */
export function PlainTable({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full border-collapse text-[13px]', className)} {...props} />
    </div>
  )
}

export function Th({ className, numeric, ...props }: ComponentProps<'th'> & { numeric?: boolean }) {
  return (
    <th
      className={cn(
        'eyebrow h-9 border-b border-hairline-strong px-3 text-left font-medium whitespace-nowrap first:pl-0 last:pr-0',
        numeric && 'text-right',
        className,
      )}
      {...props}
    />
  )
}

export function Td({ className, numeric, ...props }: ComponentProps<'td'> & { numeric?: boolean }) {
  return (
    <td
      className={cn(
        'h-11 border-b border-hairline px-3 whitespace-nowrap first:pl-0 last:pr-0',
        numeric && 'text-right figure',
        className,
      )}
      {...props}
    />
  )
}
