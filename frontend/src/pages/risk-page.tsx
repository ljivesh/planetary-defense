import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { ErrorState } from '@/components/common/error-state'
import { LoadingRows } from '@/components/common/loading-block'
import { SectionCard } from '@/components/common/section-card'
import { PageHeader } from '@/components/layout/page-header'
import { Input } from '@/components/ui/input'
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
        title="Impact risk"
        description="Objects with a non-zero chance of hitting Earth in the next century, from the JPL Sentry system"
        actions={
          <div className="relative w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name…"
              aria-label="Filter risk table by name"
              className="pl-8"
            />
          </div>
        }
      />
      <SectionCard
        title="Sentry risk table"
        description={
          data
            ? `${filtered?.length.toLocaleString()} of ${data.length.toLocaleString()} objects · sorted by cumulative Palermo scale`
            : 'Loading…'
        }
      >
        {isPending ? (
          <LoadingRows rows={12} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : (
          <RiskTable data={filtered ?? []} isFetching={isFetching} />
        )}
      </SectionCard>
    </>
  )
}
