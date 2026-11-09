import { useMemo, useState } from 'react'

import { ErrorState } from '@/components/common/error-state'
import { LoadingRows } from '@/components/common/loading-block'
import { PageHeader } from '@/components/layout/page-header'
import { RiskTable } from '@/features/risk/components/risk-table'
import { useRiskList } from '@/features/risk/hooks/use-risk-list'
import { useDebounce } from '@/hooks/use-debounce'

export default function RiskPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useRiskList()
  const [search, setSearch] = useState('')
  const q = useDebounce(search.trim().toLowerCase(), 200)

  const filtered = useMemo(
    () => (data && q ? data.filter((r) => r.fullName.toLowerCase().includes(q)) : data),
    [data, q],
  )

  return (
    <>
      <PageHeader
        eyebrow="Source · CNEOS Sentry"
        title="Impact risk"
        description="Every object with a non-zero chance of hitting Earth in the next century, sorted by the cumulative Palermo scale. Most leave the list once more observations refine their orbits."
      />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-hairline py-3">
        <label htmlFor="risk-filter" className="eyebrow">
          Filter
        </label>
        <input
          id="risk-filter"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="name or designation"
          className="h-7 w-56 rounded-[2px] border border-hairline-strong bg-transparent px-2 font-mono text-xs text-ink outline-none placeholder:text-muted-ink focus:border-signal"
        />
        {data && (
          <span className="eyebrow ml-auto">
            <span className="text-ink">{filtered?.length.toLocaleString()}</span> of {data.length.toLocaleString()}{' '}
            objects
          </span>
        )}
      </div>

      <div className="mt-8">
        {isPending ? (
          <LoadingRows rows={12} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : (
          <RiskTable data={filtered ?? []} isFetching={isFetching} />
        )}
      </div>
    </>
  )
}
