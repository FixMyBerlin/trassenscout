import { ArrowDownIcon, ArrowUpIcon, ChevronUpDownIcon } from "@heroicons/react/16/solid"
import { twJoin } from "tailwind-merge"
import { tableHeadCellClassName } from "@/src/components/core/components/Table/tableClasses"
import type { TableSort } from "@/src/shared/tableSort/tableSort"

type Props<Column extends string> = {
  column: Column
  sort: TableSort<Column> | undefined
  onSortClick?: (column: Column) => void
  className?: string
  colSpan?: number
  children: string
}

export const SortableTableHeader = <Column extends string>({
  column,
  sort,
  onSortClick,
  className = tableHeadCellClassName,
  colSpan,
  children,
}: Props<Column>) => {
  const direction = sort?.column === column ? sort.direction : undefined
  const SortIcon =
    direction === "asc" ? ArrowUpIcon : direction === "desc" ? ArrowDownIcon : ChevronUpDownIcon
  const lastSpace = children.lastIndexOf(" ")

  return (
    <th
      scope="col"
      colSpan={colSpan}
      className={className}
      aria-sort={direction ? (direction === "asc" ? "ascending" : "descending") : undefined}
    >
      {onSortClick ? (
        <button
          type="button"
          onClick={() => onSortClick(column)}
          className="cursor-pointer rounded text-left uppercase hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          {children.slice(0, lastSpace + 1)}
          {/* The icon stays with the last word when the label wraps */}
          <span className="whitespace-nowrap">
            {children.slice(lastSpace + 1)}
            <SortIcon
              aria-hidden="true"
              className={twJoin(
                "ml-1 inline-block size-4 align-text-bottom",
                direction ? "text-gray-500" : "text-gray-400",
              )}
            />
          </span>
        </button>
      ) : (
        children
      )}
    </th>
  )
}
