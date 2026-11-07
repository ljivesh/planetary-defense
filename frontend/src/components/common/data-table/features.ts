import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  metaHelper,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  type RowData,
} from '@tanstack/react-table'

export interface DataTableColumnMeta {
  /** Right-align numeric columns so digits line up. */
  align?: 'start' | 'end'
  /** Hide the column below the `md` breakpoint. */
  hideOnMobile?: boolean
}

/** Shared TanStack Table v9 feature registry: client-side sorting + pagination. */
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, datetime: sortFn_datetime, text: sortFn_text },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  columnMeta: metaHelper<DataTableColumnMeta>(),
})

export type DataTableFeatures = typeof dataTableFeatures

/** Typed column helper bound to the shared feature registry. */
export const createDataTableColumnHelper = <TData extends RowData>() => createColumnHelper<DataTableFeatures, TData>()
