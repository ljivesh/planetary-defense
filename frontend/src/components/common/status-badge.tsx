import { AlertOctagon, AlertTriangle, CheckCircle2, Info, type LucideIcon } from 'lucide-react'

import type { StatusLevel } from '@/features/risk/lib'
import { cn } from '@/lib/utils'

const STATUS: Record<StatusLevel, { icon: LucideIcon; className: string }> = {
  good: { icon: CheckCircle2, className: 'text-status-good' },
  warning: { icon: Info, className: 'text-status-warning' },
  serious: { icon: AlertTriangle, className: 'text-status-serious' },
  critical: { icon: AlertOctagon, className: 'text-status-critical' },
}

interface StatusBadgeProps {
  level: StatusLevel
  label: string
  className?: string
}

/**
 * Status indicator. Color is never the only signal: the icon shape and the
 * text label carry the meaning, and the label stays in the text color.
 */
export function StatusBadge({ level, label, className }: StatusBadgeProps) {
  const { icon: Icon, className: tone } = STATUS[level]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border bg-muted/60 px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        className,
      )}
    >
      <Icon className={cn('size-3.5', tone)} aria-hidden />
      {label}
    </span>
  )
}
