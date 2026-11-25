import { useNavigate } from "@tanstack/react-router"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { useTryRouteSearchKey } from "@/src/components/core/routes/useTryRouteSearch"
import {
  parseTableSort,
  type TableSort,
  toggleTableSortSearchValue,
} from "@/src/shared/tableSort/tableSort"

export type TableSortSearchKey = "sort" | "subsubsectionSort" | "projectRecordSort" | "uploadSort"

export type TableSortState<Column extends string> = {
  sort: TableSort<Column> | undefined
  toggleSort: (column: Column) => void
}

export function useTableSort<Column extends string>({
  searchKey,
  columns,
  defaultSort,
}: {
  searchKey: TableSortSearchKey
  columns: readonly Column[]
  defaultSort: TableSort<Column> | undefined
}): TableSortState<Column> {
  const navigate = useNavigate()
  const value = useTryRouteSearchKey(searchKey)

  const toggleSort = (column: Column) => {
    void navigate({
      to: ".",
      search: (previous) => ({
        ...previous,
        [searchKey]: toggleTableSortSearchValue(previous[searchKey], column, columns, defaultSort),
      }),
      ...preserveScrollNavigateOptions,
    })
  }

  return { sort: parseTableSort(value, columns) ?? defaultSort, toggleSort }
}
