import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

import { ErrorState } from '@/components/common/error-state'
import { LoadingChart, LoadingRows } from '@/components/common/loading-block'
import { SectionCard } from '@/components/common/section-card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { ApproachTimelineChart } from '@/features/close-approaches/components/approach-timeline-chart'
import { APPROACH_FILTER_DEFAULTS, toApproachQuery } from '@/features/close-approaches/filters'
import { useCloseApproaches } from '@/features/close-approaches/hooks/use-close-approaches'
import { LatestFireballs } from '@/features/fireballs/components/latest-fireballs'
import { useFireballs } from '@/features/fireballs/hooks/use-fireballs'
import { TopRiskList } from '@/features/risk/components/top-risk-list'
import { useRiskList } from '@/features/risk/hooks/use-risk-list'
import { KpiRow } from '@/features/summary/components/kpi-row'
import { useSummary } from '@/features/summary/hooks/use-summary'
import { formatRelative } from '@/lib/format'

const UPCOMING_QUERY = toApproachQuery(APPROACH_FILTER_DEFAULTS)

function ViewAll({ to }: { to: string }) {
  return (
    <Button variant="ghost" size="sm" asChild>
      <Link to={to}>
        View all <ArrowRight />
      </Link>
    </Button>
  )
}

export default function DashboardPage() {
  const summary = useSummary()
  const approaches = useCloseApproaches(UPCOMING_QUERY)
  const risk = useRiskList()
  const fireballs = useFireballs(50)

  return (
    <>
      <PageHeader
        title="Overview"
        description={
          summary.data
            ? `Near-Earth object activity · updated ${formatRelative(summary.data.generatedAt)}`
            : 'Near-Earth object activity from NASA/JPL'
        }
      />

      {summary.isError ? (
        <ErrorState error={summary.error} onRetry={() => summary.refetch()} />
      ) : (
        <KpiRow summary={summary.data} isLoading={summary.isPending} />
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Upcoming close approaches"
          description="Next 60 days, within 0.05 AU of Earth"
          action={<ViewAll to="/close-approaches" />}
        >
          {approaches.isPending ? (
            <LoadingChart />
          ) : approaches.isError ? (
            <ErrorState error={approaches.error} onRetry={() => approaches.refetch()} />
          ) : (
            <ApproachTimelineChart data={approaches.data} isFetching={approaches.isFetching} />
          )}
        </SectionCard>

        <SectionCard title="Highest impact risk" description="Ranked by Palermo scale" action={<ViewAll to="/risk" />}>
          {risk.isPending ? (
            <LoadingRows rows={5} />
          ) : risk.isError ? (
            <ErrorState error={risk.error} onRetry={() => risk.refetch()} />
          ) : (
            <TopRiskList items={risk.data.slice(0, 5)} />
          )}
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-3"
          title="Recent fireballs"
          description="Bolides detected by US Government sensors"
          action={<ViewAll to="/fireballs" />}
        >
          {fireballs.isPending ? (
            <LoadingRows rows={5} />
          ) : fireballs.isError ? (
            <ErrorState error={fireballs.error} onRetry={() => fireballs.refetch()} />
          ) : (
            <div className="grid gap-x-8 md:grid-cols-2">
              <LatestFireballs items={fireballs.data.slice(0, 4)} />
              <LatestFireballs items={fireballs.data.slice(4, 8)} />
            </div>
          )}
        </SectionCard>
      </div>
    </>
  )
}
