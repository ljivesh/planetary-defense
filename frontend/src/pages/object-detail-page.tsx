import { useParams } from 'react-router'

import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { LoadingChart } from '@/components/common/loading-block'
import { Section } from '@/components/common/section'
import { TextLink } from '@/components/common/text-link'
import { Skeleton } from '@/components/ui/skeleton'
import { ApproachHistoryCard } from '@/features/objects/components/approach-history-card'
import { ObjectHeader } from '@/features/objects/components/object-header'
import { OrbitElementsCard } from '@/features/objects/components/orbit-elements-card'
import { PhysicalCard } from '@/features/objects/components/physical-card'
import { RiskAssessmentCard } from '@/features/objects/components/risk-assessment-card'
import { useObject } from '@/features/objects/hooks/use-object'
import { OrbitViewer } from '@/features/orbit/components/orbit-viewer'
import { ApiError } from '@/lib/api-client'

export default function ObjectDetailPage() {
  const { designation } = useParams()
  const { data, isPending, isError, error, refetch } = useObject(designation)

  if (isPending) {
    return (
      <div className="pt-14" aria-busy="true">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="mt-5 h-14 w-80 max-w-full" />
        <LoadingChart className="mt-12 h-[600px]" />
      </div>
    )
  }

  if (isError) {
    const notFound = error instanceof ApiError && (error.isNotFound || error.status === 400)
    return notFound ? (
      <EmptyState
        label="Not found"
        title={`No object matches “${designation}”.`}
        description={
          error.message === 'object not found'
            ? 'Try a number (99942), a name (Apophis) or a provisional designation (2004 MN4).'
            : error.message
        }
        action={<TextLink to="/risk">Browse the risk table</TextLink>}
        className="py-24"
      />
    ) : (
      <ErrorState error={error} onRetry={() => refetch()} className="mt-14" />
    )
  }

  return (
    <>
      <ObjectHeader object={data} />

      <Section index="01" label="Orbit" note="Heliocentric, two-body approximation. Planets use mean J2000 elements.">
        <OrbitViewer key={data.designation} object={data} />
      </Section>

      <div className="mt-20 grid gap-x-12 gap-y-20 lg:grid-cols-2">
        <OrbitElementsCard object={data} index="02" />
        <PhysicalCard object={data} index="03" />
      </div>

      <div className="mt-20 grid gap-x-12 gap-y-20 lg:grid-cols-2">
        <RiskAssessmentCard risk={data.risk} index="04" />
        <ApproachHistoryCard designation={data.designation} index="05" />
      </div>
    </>
  )
}
