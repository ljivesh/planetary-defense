import type { ReactNode } from 'react'

interface ChartTooltipProps {
  title: ReactNode
  rows: { label: string; value: ReactNode }[]
}

/** Tooltip body for Recharts: values lead (strong), labels follow (muted). */
export function ChartTooltip({ title, rows }: ChartTooltipProps) {
  return (
    <div className="min-w-44 rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
      <div className="mb-1.5 font-medium">{title}</div>
      <dl className="space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className="font-semibold num">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
