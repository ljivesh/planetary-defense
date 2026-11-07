import { StatusBadge } from '@/components/common/status-badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { palermoLabel, palermoLevel, TORINO_DESCRIPTIONS, torinoLevel } from '@/features/risk/lib'
import { formatSigned } from '@/lib/format'

export function PalermoBadge({ value }: { value: number }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <StatusBadge level={palermoLevel(value)} label={`${formatSigned(value)} · ${palermoLabel(value)}`} />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">
        Palermo scale compares this hazard with the background impact risk. Below −2: no likely consequence; −2 to 0:
        merits monitoring; above 0: of concern.
      </TooltipContent>
    </Tooltip>
  )
}

export function TorinoBadge({ value }: { value: number | null }) {
  const ts = value ?? 0
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <StatusBadge level={torinoLevel(ts)} label={`Torino ${ts}`} />
        </span>
      </TooltipTrigger>
      <TooltipContent>{TORINO_DESCRIPTIONS[ts] ?? 'Unknown'}</TooltipContent>
    </Tooltip>
  )
}
