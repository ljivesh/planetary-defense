import { useNavigate } from 'react-router'

import { createDataTableColumnHelper, DataTable } from '@/components/common/data-table'
import { ObjectLink } from '@/features/close-approaches/components/object-link'
import type { CloseApproach } from '@/features/close-approaches/schemas'
import {
  formatDateTime,
  formatDiameter,
  formatKm,
  formatLd,
  formatNumber,
  formatRelative,
  formatVelocity,
  representativeDiameterM,
} from '@/lib/format'

const col = createDataTableColumnHelper<CloseApproach>()

const columns = col.columns([
  col.accessor('time', {
    header: 'Closest approach',
    sortFn: 'datetime',
    cell: (info) => (
      <div className="leading-tight">
        <div className="num">{formatDateTime(info.getValue())}</div>
        <div className="text-xs text-muted-foreground">{formatRelative(info.getValue())}</div>
      </div>
    ),
  }),
  col.accessor('fullName', {
    header: 'Object',
    sortFn: 'alphanumeric',
    cell: (info) => <ObjectLink designation={info.row.original.designation} name={info.getValue()} />,
  }),
  col.accessor('distanceAu', {
    header: 'Miss distance',
    meta: { align: 'end' },
    cell: (info) => (
      <div className="leading-tight">
        <div>{formatLd(info.getValue())}</div>
        <div className="text-xs text-muted-foreground">{formatKm(info.getValue())}</div>
      </div>
    ),
  }),
  col.accessor('velocityRelKms', {
    header: 'Velocity',
    meta: { align: 'end', hideOnMobile: true },
    cell: (info) => formatVelocity(info.getValue()),
  }),
  col.accessor((row) => representativeDiameterM(row) ?? undefined, {
    id: 'size',
    header: 'Size',
    meta: { align: 'end' },
    sortUndefined: 'last',
    cell: (info) => formatDiameter(info.row.original),
  }),
  col.accessor((row) => row.h ?? undefined, {
    id: 'h',
    header: 'H mag',
    meta: { align: 'end', hideOnMobile: true },
    sortUndefined: 'last',
    cell: (info) => formatNumber(info.getValue(), 1),
  }),
])

interface ApproachTableProps {
  data: CloseApproach[]
  isFetching?: boolean
  pageSize?: number
}

export function ApproachTable({ data, isFetching, pageSize }: ApproachTableProps) {
  const navigate = useNavigate()
  return (
    <DataTable
      columns={columns}
      data={data}
      pageSize={pageSize}
      isFetching={isFetching}
      getRowId={(r) => `${r.designation}-${r.time}`}
      onRowClick={(r) => navigate(`/objects/${encodeURIComponent(r.designation)}`)}
      emptyMessage="No close approaches match these filters."
    />
  )
}
