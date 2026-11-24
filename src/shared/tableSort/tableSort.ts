import { z } from "zod"

export type SortDirection = "asc" | "desc"

export type TableSort<Column extends string> = { column: Column; direction: SortDirection }

export type TableSortSearchValue<Column extends string> = `${Column}.${SortDirection}`

const isSortDirection = (value: string): value is SortDirection =>
  value === "asc" || value === "desc"

export function parseTableSort<Column extends string>(
  value: unknown,
  columns: readonly Column[],
): TableSort<Column> | undefined {
  if (typeof value !== "string") return undefined
  const separator = value.lastIndexOf(".")
  const column = value.slice(0, separator)
  const direction = value.slice(separator + 1)
  const isColumn = (candidate: string): candidate is Column =>
    (columns as readonly string[]).includes(candidate)
  if (separator < 1 || !isSortDirection(direction) || !isColumn(column)) return undefined
  return { column, direction }
}

const toSearchValue = <Column extends string>(sort: TableSort<Column>) =>
  `${sort.column}.${sort.direction}` as const

export function tableSortSearchSchema<Column extends string>(columns: readonly Column[]) {
  return z
    .string()
    .optional()
    .catch(undefined)
    .transform((value): TableSortSearchValue<Column> | undefined => {
      const sort = parseTableSort(value, columns)
      return sort ? toSearchValue(sort) : undefined
    })
}

export function tableSortSearchValue<Column extends string>(
  sort: TableSort<Column>,
  defaultSort: TableSort<Column> | undefined,
): TableSortSearchValue<Column> | undefined {
  const isDefault = defaultSort?.column === sort.column && defaultSort.direction === sort.direction
  return isDefault ? undefined : toSearchValue(sort)
}
