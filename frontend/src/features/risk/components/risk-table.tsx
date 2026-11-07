import { useNavigate } from 'react-router'

import { createDataTableColumnHelper, DataTable } from '@/components/common/data-table'
import { ObjectLink } from '@/features/close-approaches/components/object-link'
import { PalermoBadge, TorinoBadge } from '@/features/risk/components/hazard-badges'
import type { RiskObject } from '@/features/risk/schemas'
import { formatDiameter, formatNumber, formatOdds, formatVelocity, representativeDiameterM } from '@/lib/format'

const col = createDataTableColumnHelper<RiskObject>()

const columns = col.columns([
  col.accessor('fullName', {
    header: 'Object',
    sortFn: 'alphanumeric',
    cell: (info) => <ObjectLink designation={info.row.original.designation} name={info.getValue()} />,
  }),
  col.accessor('palermoCumulative', {
    header: 'Palermo (cum.)',
    cell: (info) => <PalermoBadge value={info.getValue()} />,
  }),
  col.accessor('torinoMax', {
    header: 'Torino',
    meta: { hideOnMobile: true },
    cell: (info) => <TorinoBadge value={info.getValue()} />,
  }),
  col.accessor('impactProbability', {
    header: 'Impact odds',
    meta: { align: 'end' },
    cell: (info) => formatOdds(info.getValue()),
  }),
  col.accessor('yearRange', {
    header: 'Years',
    meta: { align: 'end', hideOnMobile: true },
    sortFn: 'alphanumeric',
  }),
  col.accessor('impactCount', {
    header: 'Potential impacts',
    meta: { align: 'end', hideOnMobile: true },
    cell: (info) => formatNumber(info.getValue(), 0),
  }),
  col.accessor((row) => representativeDiameterM(row) ?? undefined, {
    id: 'size',
    header: 'Size',
    meta: { align: 'end' },
    sortUndefined: 'last',
    cell: (info) => formatDiameter(info.row.original),
  }),
  col.accessor((row) => row.velocityInfKms ?? undefined, {
    id: 'vinf',
    header: 'V∞',
    meta: { align: 'end', hideOnMobile: true },
    sortUndefined: 'last',
    cell: (info) => formatVelocity(info.getValue()),
  }),
])

interface RiskTableProps {
  data: RiskObject[]
  isFetching?: boolean
}

export function RiskTable({ data, isFetching }: RiskTableProps) {
  const navigate = useNavigate()
  return (
    <DataTable
      columns={columns}
      data={data}
      pageSize={20}
      isFetching={isFetching}
      initialSorting={[{ id: 'palermoCumulative', desc: true }]}
      getRowId={(r) => r.designation}
      onRowClick={(r) => navigate(`/objects/${encodeURIComponent(r.designation)}`)}
      emptyMessage="No objects match your search."
    />
  )
}
