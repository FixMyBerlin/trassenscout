import type { SubsectionTableSortColumn } from "@/src/shared/projects/searchSchemas"
import type { SortValues } from "@/src/shared/tableSort/sortRows"

export type SubsectionSortRow = {
  slug: string
  operator: { title: string } | null
  SubsectionStatus: { title: string } | null
  subsubsectionCount: number
  estimatedCompletionDateString: string | null
}

const yearMonthDate = (value: string | null) => {
  const match = value?.match(/^(\d{4})-(0[1-9]|1[0-2])$/)
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, 1) : null
}

export const subsectionSortValues: SortValues<SubsectionSortRow, SubsectionTableSortColumn> = {
  slug: (row) => row.slug,
  operator: (row) => row.operator?.title ?? null,
  status: (row) => row.SubsectionStatus?.title ?? null,
  subsubsectionCount: (row) => row.subsubsectionCount,
  estimatedCompletion: (row) => yearMonthDate(row.estimatedCompletionDateString),
}
