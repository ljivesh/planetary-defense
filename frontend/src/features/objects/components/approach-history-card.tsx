import { History } from 'lucide-react'
import { useMemo, useState } from 'react'

import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { LoadingRows } from '@/components/common/loading-block'
import { SectionCard } from '@/components/common/section-card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useObjectApproaches } from '@/features/close-approaches/hooks/use-close-approaches'
import { formatDateTime, formatKm, formatLd, formatVelocity } from '@/lib/format'
import { cn } from '@/lib/utils'

/** Earth encounters within 0.2 AU, 1900–2200, with the next one highlighted. */
export function ApproachHistoryCard({ designation }: { designation: string }) {
  const { data, isPending, isError, error, refetch } = useObjectApproaches(designation)

  const [now] = useState(() => Date.now())
  const nextIndex = useMemo(() => data?.findIndex((a) => new Date(a.time).getTime() > now) ?? -1, [data, now])

  return (
    <SectionCard title="Earth encounters" description="Close approaches within 0.2 AU between 1900 and 2200">
      {isPending ? (
        <LoadingRows rows={5} />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <EmptyState icon={History} title="No encounters within 0.2 AU" />
      ) : (
        <div className="max-h-96 overflow-auto rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow className="hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Distance</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Velocity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((a, i) => {
                const isPast = nextIndex === -1 || i < nextIndex
                return (
                  <TableRow key={a.time} className={cn(isPast && 'text-muted-foreground')}>
                    <TableCell className="num">
                      {formatDateTime(a.time)}
                      {i === nextIndex && (
                        <Badge variant="secondary" className="ml-2">
                          Next
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right num">
                      <div>{formatLd(a.distanceAu)}</div>
                      <div className="text-xs text-muted-foreground">{formatKm(a.distanceAu)}</div>
                    </TableCell>
                    <TableCell className="hidden text-right num sm:table-cell">
                      {formatVelocity(a.velocityRelKms)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </SectionCard>
  )
}
