import { compareSlugs } from "@/src/components/core/components/text/titles"
import {
  SUBSUBSECTION_TABLE_DEFAULT_SORT,
  type SubsubsectionTableSortColumn,
} from "@/src/shared/subsubsections/searchSchemas"
import { type SortValues, tableSortComparator } from "@/src/shared/tableSort/sortRows"
import type { TableSort } from "@/src/shared/tableSort/tableSort"

export type SubsubsectionSortRow = {
  slug: string
  subTitle: string | null
  updatedAt: Date | string
  project: { slug: string }
  subsection: { slug: string }
}

const subsubsectionSortValues: SortValues<SubsubsectionSortRow, SubsubsectionTableSortColumn> = {
  slug: (row) => row.slug,
  project: (row) => row.project.slug,
  updatedAt: (row) => new Date(row.updatedAt),
  title: (row) => row.subTitle,
}

/** Ties fall back to the Kürzel; grouped rows sort inside their Planungsabschnitt. */
export function subsubsectionRowComparator(
  sort: TableSort<SubsubsectionTableSortColumn>,
  { grouped }: { grouped: boolean },
) {
  const compareRows = tableSortComparator(
    subsubsectionSortValues,
    sort,
    SUBSUBSECTION_TABLE_DEFAULT_SORT,
  )
  return (a: SubsubsectionSortRow, b: SubsubsectionSortRow) =>
    (grouped ? compareSlugs(a.subsection.slug, b.subsection.slug) : 0) || compareRows(a, b)
}
