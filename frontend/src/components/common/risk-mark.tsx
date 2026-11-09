import type { StatusLevel } from '@/features/risk/lib'
import { cn } from '@/lib/utils'

const TONE: Record<StatusLevel, string> = {
  good: 'bg-status-good',
  warning: 'bg-status-warning',
  serious: 'bg-status-serious',
  critical: 'bg-status-critical',
}

interface RiskMarkProps {
  level: StatusLevel
  /** Leading figure, e.g. "−0.98". */
  value?: string
  /** Short state label, rendered as a mono caps word. */
  label: string
  className?: string
}

/**
 * Status indicator: 8px square in the status colour, then figure and label in
 * ink. Colour is never the only signal; the text label carries the meaning.
 */
export function RiskMark({ level, value, label, className }: RiskMarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 whitespace-nowrap', className)}>
      <span className={cn('size-2 shrink-0', TONE[level])} aria-hidden />
      {value && <span className="figure text-[13px] text-ink">{value}</span>}
      <span className="micro text-body">{label}</span>
    </span>
  )
}
