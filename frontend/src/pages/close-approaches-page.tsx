import { useMemo } from 'react'

import { ErrorState } from '@/components/common/error-state'
import { LoadingChart, LoadingRows } from '@/components/common/loading-block'
import { Section } from '@/components/common/section'
import { PageHeader } from '@/components/layout/page-header'
import { ApproachFiltersBar } from '@/features/close-approaches/components/approach-filters'
import { ApproachTable } from '@/features/close-approaches/components/approach-table'
import { ApproachTimelineChart } from '@/features/close-approaches/components/approach-timeline-chart'
import { APPROACH_FILTER_DEFAULTS, toApproachQuery } from '@/features/close-approaches/filters'
import { useCloseApproaches } from '@/features/close-approaches/hooks/use-close-approaches'
import { approachKey, closestApproach } from '@/features/close-approaches/lib'
import { useUrlState } from '@/hooks/use-url-state'

export default function CloseApproachesPage() {
  const [filters, setFilters, resetFilters] = useUrlState(APPROACH_FILTER_DEFAULTS)
  const query = useMemo(() => toApproachQuery(filters), [filters])
  const { data, isPending, isError, error, refetch, isFetching } = useCloseApproaches(query)
  const closest = useMemo(() => closestApproach(data ?? []), [data])

  return (
    <>
      <PageHeader
        eyebrow="Source · JPL SBDB close-approach data"
        title="Close approaches"
        description="Earth flybys of asteroids and comets, ordered by time. Distances are nominal; JPL also publishes 3σ minimum and maximum values."
      />
      <ApproachFiltersBar value={filters} onChange={setFilters} onReset={resetFilters} />

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} className="mt-10" />
      ) : (
        <>
          <Section
            index="01"
            label="Timeline"
            note={data ? `${data.length} approaches in the selected window. The closest is marked.` : undefined}
            className="mt-12"
          >
            {isPending ? (
              <LoadingChart />
            ) : (
              <ApproachTimelineChart
                data={data}
                highlightKey={closest ? approachKey(closest) : undefined}
                isFetching={isFetching}
                height={340}
              />
            )}
          </Section>
          <Section index="02" label="All approaches" note="Select a row to open the object." className="mt-16">
            {isPending ? <LoadingRows /> : <ApproachTable data={data} isFetching={isFetching} pageSize={20} />}
          </Section>
        </>
      )}
    </>
  )
}
