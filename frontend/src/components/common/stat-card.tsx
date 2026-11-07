import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StatCardProps {
  /** Sentence-case label, no trailing colon. */
  label: string
  value: ReactNode
  /** Secondary line under the value (context, unit, comparison). */
  hint?: ReactNode
  icon?: LucideIcon
  isLoading?: boolean
  className?: string
}

/** KPI tile: label · value · hint. Values use proportional figures. */
export function StatCard({ label, value, hint, icon: Icon, isLoading, className }: StatCardProps) {
  return (
    <Card className={cn('gap-2 py-4', className)}>
      <CardContent className="space-y-2 px-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          {Icon && <Icon className="size-4 opacity-70" aria-hidden />}
        </div>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-36" />
          </>
        ) : (
          <>
            <div className="text-2xl font-semibold tracking-tight">{value}</div>
            {hint && <div className="truncate text-xs text-muted-foreground">{hint}</div>}
          </>
        )}
      </CardContent>
    </Card>
  )
}
