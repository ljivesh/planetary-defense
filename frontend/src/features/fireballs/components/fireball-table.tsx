import { createDataTableColumnHelper, DataTable } from '@/components/common/data-table'
import { formatLocation } from '@/features/fireballs/lib'
import type { Fireball } from '@/features/fireballs/schemas'
import { formatDateTime, formatEnergyKt, formatNumber, formatVelocity } from '@/lib/format'

const col = createDataTableColumnHelper<Fireball>()

const columns = col.columns([
  col.accessor('time', {
    header: 'Peak brightness',
    sortFn: 'datetime',
    cell: (info) => <span className="num">{formatDateTime(info.getValue())}</span>,
  }),
  col.accessor((row) => formatLocation(row), {
    id: 'location',
    header: 'Location',
    enableSorting: false,
  }),
  col.accessor('impactEnergyKt', {
    header: 'Impact energy',
    meta: { align: 'end' },
    cell: (info) => formatEnergyKt(info.getValue()),
  }),
  col.accessor('radiatedEnergyJ', {
    header: 'Radiated',
    meta: { align: 'end', hideOnMobile: true },
    cell: (info) => `${formatNumber(info.getValue() / 1e9, 1)} GJ`,
  }),
  col.accessor((row) => row.altitudeKm ?? undefined, {
    id: 'alt',
    header: 'Altitude',
    meta: { align: 'end', hideOnMobile: true },
    sortUndefined: 'last',
    cell: (info) => (info.getValue() === undefined ? '—' : `${formatNumber(info.getValue(), 1)} km`),
  }),
  col.accessor((row) => row.velocityKms ?? undefined, {
    id: 'vel',
    header: 'Velocity',
    meta: { align: 'end', hideOnMobile: true },
    sortUndefined: 'last',
    cell: (info) => formatVelocity(info.getValue()),
  }),
])

export function FireballTable({ data, isFetching }: { data: Fireball[]; isFetching?: boolean }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      pageSize={15}
      isFetching={isFetching}
      initialSorting={[{ id: 'time', desc: true }]}
      getRowId={(r) => r.time}
      emptyMessage="No fireball events reported."
    />
  )
}
