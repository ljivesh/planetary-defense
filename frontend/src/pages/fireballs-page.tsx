import { ErrorState } from '@/components/common/error-state'
import { LoadingChart, LoadingRows } from '@/components/common/loading-block'
import { Section } from '@/components/common/section'
import { PageHeader } from '@/components/layout/page-header'
import { FireballEnergyChart } from '@/features/fireballs/components/fireball-energy-chart'
import { FireballTable } from '@/features/fireballs/components/fireball-table'
import { useFireballs } from '@/features/fireballs/hooks/use-fireballs'

export default function FireballsPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useFireballs(500)

  return (
    <>
      <PageHeader
        eyebrow="Source · US Government sensors via JPL"
        title="Fireballs"
        description="Bright meteors (bolides) seen exploding in the atmosphere. Energies are estimated from the light curve; most are metre-sized rocks that never reach the ground."
      />
      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <>
          <Section index="01" label="Impact energy" note="Kilotons of TNT equivalent, log scale.">
            {isPending ? <LoadingChart /> : <FireballEnergyChart data={data} />}
          </Section>
          <Section
            index="02"
            label="Events"
            note={data ? `${data.length} most recent events.` : undefined}
            className="mt-16"
          >
            {isPending ? <LoadingRows /> : <FireballTable data={data} isFetching={isFetching} />}
          </Section>
        </>
      )}
    </>
  )
}
