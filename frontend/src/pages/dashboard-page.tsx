import { useMemo } from 'react'

import { ErrorState } from '@/components/common/error-state'
import { LoadingChart, LoadingRows } from '@/components/common/loading-block'
import { Section } from '@/components/common/section'
import { TextLink } from '@/components/common/text-link'
import { ApproachTimelineChart } from '@/features/close-approaches/components/approach-timeline-chart'
import { ClosestFlyby, ClosestFlybySkeleton } from '@/features/close-approaches/components/closest-flyby'
import { APPROACH_FILTER_DEFAULTS, toApproachQuery } from '@/features/close-approaches/filters'
import { useCloseApproaches } from '@/features/close-approaches/hooks/use-close-approaches'
import { approachKey, closestApproach } from '@/features/close-approaches/lib'
import { LatestFireballs } from '@/features/fireballs/components/latest-fireballs'
import { useFireballs } from '@/features/fireballs/hooks/use-fireballs'
import { TopRiskList } from '@/features/risk/components/top-risk-list'
import { useRiskList } from '@/features/risk/hooks/use-risk-list'
import { SummaryReadouts } from '@/features/summary/components/summary-readouts'
import { useSummary } from '@/features/summary/hooks/use-summary'

const UPCOMING_QUERY = toApproachQuery(APPROACH_FILTER_DEFAULTS)
const WINDOW_DAYS = Number(APPROACH_FILTER_DEFAULTS.window)

export default function DashboardPage() {
  const summary = useSummary()
  const approaches = useCloseApproaches(UPCOMING_QUERY)
  const risk = useRiskList()
  const fireballs = useFireballs(50)

  const closest = useMemo(() => closestApproach(approaches.data ?? []), [approaches.data])

  return (
    <>
      <h1 className="sr-only">Planetary defense overview</h1>

      <Section index="01" label={`Closest flyby · next ${WINDOW_DAYS} days`} className="mt-10 border-t-0 md:mt-14">
        {approaches.isPending ? (
          <ClosestFlybySkeleton />
        ) : approaches.isError ? (
          <ErrorState error={approaches.error} onRetry={() => approaches.refetch()} />
        ) : (
          <ClosestFlyby approach={closest} all={approaches.data} windowDays={WINDOW_DAYS} />
        )}
      </Section>

      <div className="mt-14">
        {summary.isError ? (
          <ErrorState error={summary.error} onRetry={() => summary.refetch()} />
        ) : (
          <SummaryReadouts summary={summary.data} isLoading={summary.isPending} />
        )}
      </div>

      <Section
        index="02"
        label="Close approaches"
        title="Upcoming flybys"
        note={`Every approach within 0.05 AU in the next ${WINDOW_DAYS} days. The closest is marked.`}
        action={<TextLink to="/close-approaches">All approaches</TextLink>}
        className="mt-20"
      >
        {approaches.isPending ? (
          <LoadingChart />
        ) : approaches.isError ? null : (
          <ApproachTimelineChart
            data={approaches.data}
            highlightKey={closest ? approachKey(closest) : undefined}
            isFetching={approaches.isFetching}
          />
        )}
      </Section>

      <div className="mt-20 grid gap-x-12 gap-y-20 xl:grid-cols-2">
        <Section
          index="03"
          label="Impact risk"
          title="Highest Palermo scale"
          action={<TextLink to="/risk">Risk table</TextLink>}
        >
          {risk.isPending ? (
            <LoadingRows rows={5} />
          ) : risk.isError ? (
            <ErrorState error={risk.error} onRetry={() => risk.refetch()} />
          ) : (
            <TopRiskList items={risk.data.slice(0, 5)} />
          )}
        </Section>

        <Section
          index="04"
          label="Fireballs"
          title="Recent atmospheric impacts"
          action={<TextLink to="/fireballs">All events</TextLink>}
        >
          {fireballs.isPending ? (
            <LoadingRows rows={5} />
          ) : fireballs.isError ? (
            <ErrorState error={fireballs.error} onRetry={() => fireballs.refetch()} />
          ) : (
            <LatestFireballs items={fireballs.data.slice(0, 5)} />
          )}
        </Section>
      </div>
    </>
  )
}
