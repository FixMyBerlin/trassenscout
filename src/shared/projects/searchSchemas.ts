import { z } from "zod"
import {
  SUBSUBSECTION_TABLE_SORT_COLUMNS,
  subsubsectionSearchtermSchema,
} from "@/src/shared/subsubsections/searchSchemas"
import { type TableSort, tableSortSearchSchema } from "@/src/shared/tableSort/tableSort"

export const SUBSECTION_TABLE_SORT_COLUMNS = [
  "slug",
  "operator",
  "status",
  "subsubsectionCount",
  "estimatedCompletion",
] as const

export type SubsectionTableSortColumn = (typeof SUBSECTION_TABLE_SORT_COLUMNS)[number]

export const SUBSECTION_TABLE_DEFAULT_SORT: TableSort<SubsectionTableSortColumn> = {
  column: "slug",
  direction: "asc",
}

export const projectDashboardSearchSchema = z.object({
  operator: z.coerce.string().optional(),
  searchterm: subsubsectionSearchtermSchema,
  sort: tableSortSearchSchema(SUBSECTION_TABLE_SORT_COLUMNS),
  subsubsectionSort: tableSortSearchSchema(SUBSUBSECTION_TABLE_SORT_COLUMNS),
})

export const adminProjectsSearchSchema = z.object({
  project: z.coerce.string().optional(),
})
