import { useTable, type ColumnDef, type RowData, type SortingState } from '@tanstack/react-table'
import { ArrowDown, ArrowUp } from 'lucide-react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { dataTableFeatures, type DataTableFeatures } from '@/components/common/data-table/features'
import { cn } from '@/lib/utils'

interface DataTableProps<TData extends RowData> {
  // Columns are heterogeneous by design (each keeps its own value type).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<DataTableFeatures, TData, any>[]
  data: TData[]
  pageSize?: number
  initialSorting?: SortingState
  getRowId?: (row: TData, index: number) => string
  onRowClick?: (row: TData) => void
  /** Dims the table while background data refreshes (keeps the frame). */
  isFetching?: boolean
  emptyMessage?: string
  className?: string
}

/**
 * Sortable, paginated data-sheet table (TanStack Table v9): no outer frame, mono
 * caps headers, hairline rows, mono right-aligned figures.
 */
export function DataTable<TData extends RowData>({
  columns,
  data,
  pageSize = 15,
  initialSorting = [],
  getRowId,
  onRowClick,
  isFetching = false,
  emptyMessage = 'No results.',
  className,
}: DataTableProps<TData>) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    initialState: { sorting: initialSorting, pagination: { pageIndex: 0, pageSize } },
  })

  const rows = table.getRowModel().rows
  const pageCount = table.getPageCount()
  const { pageIndex } = table.state.pagination

  return (
    <div className={cn('transition-opacity', isFetching && 'opacity-60', className)}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="border-hairline-strong hover:bg-transparent">
                {group.headers.map((header) => {
                  const meta = header.column.columnDef.meta
                  const sorted = header.column.getIsSorted()
                  const canSort = header.column.getCanSort()
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
                      className={cn(
                        'eyebrow h-9 px-3 first:pl-0 last:pr-0',
                        meta?.align === 'end' && 'text-right',
                        meta?.hideOnMobile && 'hidden md:table-cell',
                      )}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            'inline-flex items-center gap-1 uppercase hover:text-ink',
                            sorted && 'text-ink',
                            meta?.align === 'end' && 'flex-row-reverse',
                          )}
                        >
                          <table.FlexRender header={header} />
                          {sorted === 'asc' ? (
                            <ArrowUp className="size-3" />
                          ) : sorted === 'desc' ? (
                            <ArrowDown className="size-3" />
                          ) : null}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 px-0 text-body">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === 'Enter') onRowClick(row.original)
                        }
                      : undefined
                  }
                  className={cn(
                    'border-hairline hover:bg-surface',
                    onRowClick && 'cursor-pointer outline-none focus-visible:bg-surface',
                  )}
                >
                  {row.getAllCells().map((cell) => {
                    const meta = cell.column.columnDef.meta
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'h-11 px-3 text-[13px] first:pl-0 last:pr-0',
                          meta?.align === 'end' && 'text-right figure',
                          meta?.hideOnMobile && 'hidden md:table-cell',
                        )}
                      >
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-4 border-t border-hairline pt-3">
          <span className="eyebrow">
            {(pageIndex * pageSize + 1).toLocaleString()}–
            {Math.min((pageIndex + 1) * pageSize, data.length).toLocaleString()} of {data.length.toLocaleString()}
          </span>
          <div className="flex gap-4">
            <button
              type="button"
              className="eyebrow text-body hover:text-ink disabled:opacity-30"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              ← Prev
            </button>
            <span className="eyebrow text-ink">
              {pageIndex + 1} / {pageCount}
            </span>
            <button
              type="button"
              className="eyebrow text-body hover:text-ink disabled:opacity-30"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
