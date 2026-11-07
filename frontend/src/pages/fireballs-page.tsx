import { ErrorState } from '@/components/common/error-state'
import { LoadingChart, LoadingRows } from '@/components/common/loading-block'
import { SectionCard } from '@/components/common/section-card'
import { PageHeader } from '@/components/layout/page-header'
import { FireballEnergyChart } from '@/features/fireballs/components/fireball-energy-chart'
import { FireballTable } from '@/features/fireballs/components/fireball-table'
import { useFireballs } from '@/features/fireballs/hooks/use-fireballs'

export default function FireballsPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useFireballs(500)

  return (
    <>
      <PageHeader
        title="Fireballs"
        description="Bright meteors (bolides) detected by US Government sensors, via the JPL Fireball API"
      />
      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <div className="space-y-6">
          <SectionCard title="Impact energy over time" description="Log scale · kilotons of TNT equivalent">
            {isPending ? <LoadingChart /> : <FireballEnergyChart data={data} />}
          </SectionCard>
          <SectionCard title="Events" description={data ? `${data.length} most recent events` : 'Loading…'}>
            {isPending ? <LoadingRows /> : <FireballTable data={data} isFetching={isFetching} />}
          </SectionCard>
        </div>
      )}
    </>
  )
}
