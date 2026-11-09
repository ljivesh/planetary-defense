import { Readout, ReadoutRow } from '@/components/common/readout'
import { formatLocation } from '@/features/fireballs/lib'
import type { Summary } from '@/features/summary/schemas'
import {
  displayName,
  formatDate,
  formatDiameter,
  formatNumber,
  formatOdds,
  representativeDiameterM,
} from '@/lib/format'

/** Overview readouts: activity, the biggest flyby, the risk list and the latest fireball. */
export function SummaryReadouts({ summary, isLoading }: { summary: Summary | undefined; isLoading: boolean }) {
  const s = summary
  const days = s?.windowDays ?? 30
  const largest = s?.largestApproach
  const largestM = largest ? representativeDiameterM(largest) : null
  const kt = s?.latestFireball?.impactEnergyKt

  return (
    <ReadoutRow>
      <Readout
        label={`Approaches · ${days} d`}
        isLoading={isLoading}
        value={formatNumber(s?.approachCount, 0)}
        note="within 0.05 AU (19.5 LD)"
      />
      <Readout
        label={`Inside the Moon · ${days} d`}
        isLoading={isLoading}
        value={formatNumber(s?.withinLunarDistance, 0)}
        note="closer than 1 LD"
      />
      <Readout
        label={`Largest flyby · ${days} d`}
        isLoading={isLoading}
        value={
          largestM === null ? '—' : largestM >= 1000 ? formatNumber(largestM / 1000, 1) : formatNumber(largestM, 0)
        }
        unit={largestM === null ? undefined : largestM >= 1000 ? 'km' : 'm'}
        note={
          largest &&
          `${displayName(largest.fullName)}${largest.diameterM === null ? ` · est. ${formatDiameter(largest)}` : ''}`
        }
      />
      <Readout
        label="Sentry risk list"
        isLoading={isLoading}
        value={formatNumber(s?.sentryCount, 0)}
        unit="objects"
        note={
          s?.highestRisk &&
          `top ${displayName(s.highestRisk.fullName)} · ${formatOdds(s.highestRisk.impactProbability)}`
        }
      />
      <Readout
        label="Latest fireball"
        isLoading={isLoading}
        value={kt === undefined ? '—' : kt >= 1000 ? formatNumber(kt / 1000, 1) : formatNumber(kt, kt < 1 ? 2 : 1)}
        unit={kt === undefined ? undefined : kt >= 1000 ? 'Mt' : 'kt'}
        note={s?.latestFireball && `${formatDate(s.latestFireball.time)} · ${formatLocation(s.latestFireball)}`}
      />
    </ReadoutRow>
  )
}
