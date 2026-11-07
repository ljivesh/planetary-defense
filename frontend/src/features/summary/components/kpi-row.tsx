import { Crosshair, Flame, Orbit, ShieldAlert } from 'lucide-react'

import { StatCard } from '@/components/common/stat-card'
import type { Summary } from '@/features/summary/schemas'
import { formatDate, formatDiameter, formatEnergyKt, formatLd, formatNumber, formatOdds } from '@/lib/format'

const stripParens = (s: string) => s.replace(/^\((.*)\)$/, '$1')

/** Four headline KPIs for the overview page. */
export function KpiRow({ summary, isLoading }: { summary: Summary | undefined; isLoading: boolean }) {
  const s = summary
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={`Close approaches, next ${s?.windowDays ?? 30} days`}
        icon={Orbit}
        isLoading={isLoading}
        value={formatNumber(s?.approachCount, 0)}
        hint={
          s &&
          (s.withinLunarDistance > 0 ? `${s.withinLunarDistance} inside the Moon's orbit` : 'Within 0.05 AU (19.5 LD)')
        }
      />
      <StatCard
        label="Closest upcoming flyby"
        icon={Crosshair}
        isLoading={isLoading}
        value={s?.closestApproach ? formatLd(s.closestApproach.distanceAu) : '—'}
        hint={
          s?.closestApproach &&
          `${stripParens(s.closestApproach.fullName)} · ${formatDate(s.closestApproach.time)} · ${formatDiameter(s.closestApproach)}`
        }
      />
      <StatCard
        label="Objects on the Sentry risk list"
        icon={ShieldAlert}
        isLoading={isLoading}
        value={formatNumber(s?.sentryCount, 0)}
        hint={
          s?.highestRisk &&
          `Top: ${stripParens(s.highestRisk.fullName)} (${formatOdds(s.highestRisk.impactProbability)})`
        }
      />
      <StatCard
        label="Latest fireball"
        icon={Flame}
        isLoading={isLoading}
        value={s?.latestFireball ? formatEnergyKt(s.latestFireball.impactEnergyKt) : '—'}
        hint={s?.latestFireball && `Impact energy · ${formatDate(s.latestFireball.time)}`}
      />
    </div>
  )
}
