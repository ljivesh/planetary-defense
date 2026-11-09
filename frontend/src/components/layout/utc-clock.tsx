import { useNow } from '@/hooks/use-now'
import { cn } from '@/lib/utils'

/** Live UTC clock: "2026-11-07 05:12:44 UTC". */
export function UtcClock({ className }: { className?: string }) {
  const now = useNow(1000)
  const stamp = new Date(now).toISOString().slice(0, 19).replace('T', ' ')
  return (
    <time dateTime={new Date(now).toISOString()} className={cn('figure text-[11px] text-body', className)}>
      {stamp} <span className="text-muted-ink">UTC</span>
    </time>
  )
}
