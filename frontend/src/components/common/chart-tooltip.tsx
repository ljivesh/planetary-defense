import type { ReactNode } from 'react'

interface ChartTooltipProps {
  title: ReactNode
  rows: { label: string; value: ReactNode }[]
}

/** Flat tooltip body: canvas background, hairline border, mono values in ink, labels muted. */
export function ChartTooltip({ title, rows }: ChartTooltipProps) {
  return (
    <div className="min-w-52 border border-hairline-strong bg-canvas px-3 py-2.5 text-xs text-ink">
      <div className="mb-2 font-medium">{title}</div>
      <dl className="space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-6">
            <dt className="micro text-muted-ink">{r.label}</dt>
            <dd className="figure">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
