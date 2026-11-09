import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/** Placeholder rows for tables and lists on first load: hairline-separated bars. */
export function LoadingRows({ rows = 8, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('divide-y divide-hairline', className)} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-6 py-3">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="ml-auto h-3 w-16" />
        </div>
      ))}
    </div>
  )
}

/** Placeholder for a chart area on first load. */
export function LoadingChart({ className }: { className?: string }) {
  return <Skeleton className={cn('h-72 w-full', className)} aria-busy="true" aria-label="Loading chart" />
}
