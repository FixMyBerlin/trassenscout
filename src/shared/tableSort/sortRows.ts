import type { SortDirection, TableSort } from "./tableSort"

export type SortValue = string | number | Date | null | undefined

export type SortValues<Row, Column extends string> = Record<Column, (row: Row) => SortValue>

const textCollator = new Intl.Collator("de-DE", { numeric: true, sensitivity: "base" })

export const compareText = (a: string, b: string) => textCollator.compare(a, b)

const hasValue = (value: SortValue): value is string | number | Date => {
  if (value == null) return false
  if (typeof value === "string") return value.trim() !== ""
  if (typeof value === "number") return !Number.isNaN(value)
  return !Number.isNaN(value.getTime())
}

function compareFilled(a: string | number | Date, b: string | number | Date) {
  if (typeof a === "string" && typeof b === "string") return compareText(a, b)
  if (typeof a === "number" && typeof b === "number") return a - b
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  return compareText(String(a), String(b))
}

/** Empty values sort after all others in both directions. */
export function compareSortValues(a: SortValue, b: SortValue, direction: SortDirection) {
  if (!hasValue(a) || !hasValue(b)) return Number(!hasValue(a)) - Number(!hasValue(b))
  const result = compareFilled(a, b)
  return direction === "asc" ? result : -result
}

function tableSortComparator<Row, Column extends string>(
  sortValues: SortValues<Row, Column>,
  sort: TableSort<Column> | undefined,
  fallback?: TableSort<Column>,
) {
  const sorts = !sort ? [] : fallback && fallback.column !== sort.column ? [sort, fallback] : [sort]
  return (a: Row, b: Row) => {
    for (const { column, direction } of sorts) {
      const result = compareSortValues(sortValues[column](a), sortValues[column](b), direction)
      if (result !== 0) return result
    }
    return 0
  }
}

export function sortRows<Row, Column extends string>(
  rows: readonly Row[],
  sortValues: SortValues<Row, Column>,
  sort: TableSort<Column> | undefined,
  fallback?: TableSort<Column>,
) {
  return [...rows].sort(tableSortComparator(sortValues, sort, fallback))
}

export function nextTableSort<Column extends string>(
  current: TableSort<Column> | undefined,
  column: Column,
): TableSort<Column> {
  if (current?.column !== column) return { column, direction: "asc" }
  return { column, direction: current.direction === "asc" ? "desc" : "asc" }
}
