import type { ProjectRecord } from "@/src/server/projectRecords/types"
import type { ProjectRecordTableSortColumn } from "@/src/shared/projectRecords/searchSchemas"
import type { SortValues } from "@/src/shared/tableSort/sortRows"
import { assignedToPillShortLabel } from "./ProjectRecordAssignedToPill"

export type ProjectRecordSortRow = {
  date: Date | string | null
  title: string
  assignedTo?: ProjectRecord["assignedTo"]
}

export const projectRecordSortValues: SortValues<
  ProjectRecordSortRow,
  ProjectRecordTableSortColumn
> = {
  date: (row) => (row.date ? new Date(row.date) : null),
  title: (row) => row.title,
  assignedTo: (row) => (row.assignedTo ? assignedToPillShortLabel(row.assignedTo) : null),
}
