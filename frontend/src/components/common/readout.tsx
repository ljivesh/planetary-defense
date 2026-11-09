import type { ReactNode } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ReadoutProps {
  label: string
  value: ReactNode
  /** Unit, rendered muted next to the value. */
  unit?: string
  /** One line of context under the value. */
  note?: ReactNode
  isLoading?: boolean
  className?: string
}

/** One instrument readout: label / mono figure + unit / context line. */
export function Readout({ label, value, unit, note, isLoading, className }: ReadoutProps) {
  return (
    <div className={cn('min-w-0 py-5', className)}>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-3">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="mt-2 h-3 w-36" />
          </>
        ) : (
          <>
            <span className="figure text-[28px] leading-none tracking-tight text-ink md:text-[32px]">{value}</span>
            {unit && <span className="ml-1.5 figure text-sm text-muted-ink">{unit}</span>}
            {note && <p className="mt-2 truncate text-xs text-body">{note}</p>}
          </>
        )}
      </dd>
    </div>
  )
}

/**
 * A row of readouts divided by hairlines (1px grid gaps over a hairline
 * background). Two columns on small screens; an odd last readout spans both.
 */
export function ReadoutRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <dl
      className={cn(
        'grid grid-cols-2 gap-px border-y border-hairline bg-hairline md:auto-cols-fr md:grid-flow-col md:grid-cols-none',
        '[&>*]:bg-canvas [&>*]:px-4 md:[&>*]:px-6 max-md:[&>*:last-child:nth-child(odd)]:col-span-2',
        'md:[&>*:first-child]:pl-0 max-md:[&>*:nth-child(odd)]:pl-0',
        className,
      )}
    >
      {children}
    </dl>
  )
}
