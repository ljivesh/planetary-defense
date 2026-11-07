import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/** Placeholder rows for tables and lists on first load. */
export function LoadingRows({ rows = 8, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  )
}

/** Placeholder for a chart area on first load. */
export function LoadingChart({ className }: { className?: string }) {
  return <Skeleton className={cn('h-72 w-full', className)} aria-busy="true" aria-label="Loading chart" />
}
