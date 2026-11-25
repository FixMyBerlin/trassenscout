import { z } from "zod"
import { PROJECT_RECORD_TABLE_SORT_COLUMNS } from "@/src/shared/projectRecords/searchSchemas"
import { type TableSort, tableSortSearchSchema } from "@/src/shared/tableSort/tableSort"
import { UPLOAD_TABLE_SORT_COLUMNS } from "@/src/shared/uploads/searchSchemas"

export const subsubsectionEditSearchSchema = z.object({
  // JSON search: `?mcpDraft=true` parses as boolean; a quoted value parses as "true".
  mcpDraft: z.union([z.literal(true), z.literal("true")]).optional(),
})

export const subsubsectionNewSearchSchema = subsubsectionEditSearchSchema.extend({
  slug: z.string().min(1).optional(),
})

export function isSubsubsectionMcpDraftSearch(mcpDraft: true | "true" | undefined) {
  return mcpDraft === true || mcpDraft === "true"
}

export const subsubsectionSearchtermSchema = z.coerce.string().optional().catch(undefined)

export const SUBSUBSECTION_TABLE_SORT_COLUMNS = ["slug", "updatedAt", "title"] as const

// Only Meine Maßnahmen with several projects shows a Projekt column
export const SUBSUBSECTION_TABLE_SORT_COLUMNS_WITH_PROJECT = [
  ...SUBSUBSECTION_TABLE_SORT_COLUMNS,
  "project",
] as const

export type SubsubsectionTableSortColumn =
  (typeof SUBSUBSECTION_TABLE_SORT_COLUMNS_WITH_PROJECT)[number]

export const SUBSUBSECTION_TABLE_DEFAULT_SORT: TableSort<SubsubsectionTableSortColumn> = {
  column: "slug",
  direction: "asc",
}

export const subsectionDashboardSearchSchema = z.object({
  searchterm: subsubsectionSearchtermSchema,
  sort: tableSortSearchSchema(SUBSUBSECTION_TABLE_SORT_COLUMNS),
})

export const subsubsectionDashboardSearchSchema = z.object({
  projectRecordSort: tableSortSearchSchema(PROJECT_RECORD_TABLE_SORT_COLUMNS),
  uploadSort: tableSortSearchSchema(UPLOAD_TABLE_SORT_COLUMNS),
})
