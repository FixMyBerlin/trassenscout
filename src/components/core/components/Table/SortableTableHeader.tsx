import { ArrowDownIcon, ArrowUpIcon, ChevronUpDownIcon } from "@heroicons/react/16/solid"
import { twJoin } from "tailwind-merge"
import { tableHeadCellClassName } from "@/src/components/core/components/Table/tableClasses"
import { nextTableSort } from "@/src/shared/tableSort/sortRows"
import type { TableSort } from "@/src/shared/tableSort/tableSort"

type Props<Column extends string> = {
  column: Column
  sort: TableSort<Column> | undefined
  onSortChange?: (next: TableSort<Column>) => void
  className?: string
  colSpan?: number
  children: string
}

export const SortableTableHeader = <Column extends string>({
  column,
  sort,
  onSortChange,
  className = tableHeadCellClassName,
  colSpan,
  children,
}: Props<Column>) => {
  const direction = sort?.column === column ? sort.direction : undefined
  const SortIcon =
    direction === "asc" ? ArrowUpIcon : direction === "desc" ? ArrowDownIcon : ChevronUpDownIcon

  return (
    <th
      scope="col"
      colSpan={colSpan}
      className={className}
      aria-sort={direction ? (direction === "asc" ? "ascending" : "descending") : undefined}
    >
      {onSortChange ? (
        <button
          type="button"
          onClick={() => onSortChange(nextTableSort(sort, column))}
          className="inline-flex cursor-pointer items-center gap-1 rounded text-left uppercase hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          {children}
          <SortIcon
            aria-hidden="true"
            className={twJoin("size-4 shrink-0", direction ? "text-gray-900" : "text-gray-400")}
          />
        </button>
      ) : (
        children
      )}
    </th>
  )
}
