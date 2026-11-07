import { useMemo } from 'react'

import { ErrorState } from '@/components/common/error-state'
import { LoadingChart, LoadingRows } from '@/components/common/loading-block'
import { SectionCard } from '@/components/common/section-card'
import { PageHeader } from '@/components/layout/page-header'
import { ApproachFiltersBar } from '@/features/close-approaches/components/approach-filters'
import { ApproachTable } from '@/features/close-approaches/components/approach-table'
import { ApproachTimelineChart } from '@/features/close-approaches/components/approach-timeline-chart'
import { APPROACH_FILTER_DEFAULTS, toApproachQuery } from '@/features/close-approaches/filters'
import { useCloseApproaches } from '@/features/close-approaches/hooks/use-close-approaches'
import { useUrlState } from '@/hooks/use-url-state'

export default function CloseApproachesPage() {
  const [filters, setFilters, resetFilters] = useUrlState(APPROACH_FILTER_DEFAULTS)
  const query = useMemo(() => toApproachQuery(filters), [filters])
  const { data, isPending, isError, error, refetch, isFetching } = useCloseApproaches(query)

  return (
    <>
      <PageHeader
        title="Close approaches"
        description="Earth flybys of near-Earth objects from the JPL Close Approach Data API"
      />
      <div className="mb-6">
        <ApproachFiltersBar value={filters} onChange={setFilters} onReset={resetFilters} />
      </div>

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <div className="space-y-6">
          <SectionCard
            title="Timeline"
            description={data ? `${data.length} approaches in the selected window` : 'Loading…'}
          >
            {isPending ? <LoadingChart /> : <ApproachTimelineChart data={data} isFetching={isFetching} height={340} />}
          </SectionCard>
          <SectionCard title="All approaches" description="Click a row to open the object profile">
            {isPending ? <LoadingRows /> : <ApproachTable data={data} isFetching={isFetching} pageSize={20} />}
          </SectionCard>
        </div>
      )}
    </>
  )
}
