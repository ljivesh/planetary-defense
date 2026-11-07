import { SearchX } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { LoadingChart } from '@/components/common/loading-block'
import { Button } from '@/components/ui/button'
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
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <LoadingChart className="h-[420px]" />
      </div>
    )
  }

  if (isError) {
    const notFound = error instanceof ApiError && (error.isNotFound || error.status === 400)
    return notFound ? (
      <EmptyState
        icon={SearchX}
        title={`No object matches “${designation}”`}
        description={
          error.message === 'object not found'
            ? 'Try a number (99942), a name (Apophis) or a provisional designation (2004 MN4).'
            : error.message
        }
        action={
          <Button variant="outline" asChild>
            <Link to="/risk">Browse the risk table</Link>
          </Button>
        }
        className="py-20"
      />
    ) : (
      <ErrorState error={error} onRetry={() => refetch()} />
    )
  }

  return (
    <>
      <ObjectHeader object={data} />
      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-3">
          <OrbitViewer object={data} />
          <OrbitElementsCard object={data} />
        </div>
        <div className="space-y-6 xl:col-span-2">
          <RiskAssessmentCard risk={data.risk} />
          <PhysicalCard object={data} />
          <ApproachHistoryCard designation={data.designation} />
        </div>
      </div>
    </>
  )
}
