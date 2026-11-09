import { RiskMark } from '@/components/common/risk-mark'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { palermoLabel, palermoLevel, TORINO_DESCRIPTIONS, torinoLevel } from '@/features/risk/lib'
import { formatSigned } from '@/lib/format'

const TOOLTIP_CLASS = 'max-w-64 rounded-[2px] border border-hairline-strong bg-canvas text-xs text-body'

export function PalermoMark({ value }: { value: number }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <RiskMark level={palermoLevel(value)} value={formatSigned(value)} label={palermoLabel(value)} />
        </span>
      </TooltipTrigger>
      <TooltipContent className={TOOLTIP_CLASS}>
        Palermo scale: log₁₀ of this hazard relative to the background impact risk. Below −2 no likely consequence; −2
        to 0 merits monitoring; above 0 of concern.
      </TooltipContent>
    </Tooltip>
  )
}

export function TorinoMark({ value }: { value: number | null }) {
  const ts = value ?? 0
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <RiskMark level={torinoLevel(ts)} value={String(ts)} label="Torino" />
        </span>
      </TooltipTrigger>
      <TooltipContent className={TOOLTIP_CLASS}>{TORINO_DESCRIPTIONS[ts] ?? 'Unknown'}</TooltipContent>
    </Tooltip>
  )
}
