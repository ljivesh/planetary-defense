import { useTable, type ColumnDef, type RowData, type SortingState } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
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

/** Sortable, paginated table built on TanStack Table v9 and shadcn/ui primitives. */
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
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => {
                  const meta = header.column.columnDef.meta
                  const sorted = header.column.getIsSorted()
                  const canSort = header.column.getCanSort()
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
                      className={cn(
                        'text-xs font-medium tracking-wide text-muted-foreground uppercase',
                        meta?.align === 'end' && 'text-right',
                        meta?.hideOnMobile && 'hidden md:table-cell',
                      )}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            'inline-flex items-center gap-1 hover:text-foreground',
                            meta?.align === 'end' && 'flex-row-reverse',
                          )}
                        >
                          <table.FlexRender header={header} />
                          {sorted === 'asc' ? (
                            <ArrowUp className="size-3" />
                          ) : sorted === 'desc' ? (
                            <ArrowDown className="size-3" />
                          ) : (
                            <ArrowUpDown className="size-3 opacity-40" />
                          )}
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
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
                  className={cn(onRowClick && 'cursor-pointer outline-none focus-visible:bg-muted/60')}
                >
                  {row.getAllCells().map((cell) => {
                    const meta = cell.column.columnDef.meta
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          meta?.align === 'end' && 'text-right num',
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
        <div className="flex items-center justify-between gap-2 pt-3 text-sm text-muted-foreground">
          <span className="num">
            {data.length.toLocaleString()} rows · page {pageIndex + 1} of {pageCount}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Previous page"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Next page"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
