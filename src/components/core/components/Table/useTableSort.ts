import { useNavigate } from "@tanstack/react-router"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { useTryRouteSearchKey } from "@/src/components/core/routes/useTryRouteSearch"
import {
  parseTableSort,
  type TableSort,
  tableSortSearchValue,
} from "@/src/shared/tableSort/tableSort"

export type TableSortSearchKey = "sort"

export type TableSortState<Column extends string> = {
  sort: TableSort<Column> | undefined
  setSort: (next: TableSort<Column>) => void
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

  const setSort = (next: TableSort<Column>) => {
    void navigate({
      to: ".",
      search: (previous) => ({
        ...previous,
        [searchKey]: tableSortSearchValue(next, defaultSort),
      }),
      ...preserveScrollNavigateOptions,
    })
  }

  return { sort: parseTableSort(value, columns) ?? defaultSort, setSort }
}
