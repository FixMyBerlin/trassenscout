import { z } from "zod"
import { ASSIGNMENT_DIRECTIONS } from "@/src/shared/projectRecords/assignmentDirection"
import { projectRecordModalSearchShape } from "@/src/shared/projectRecords/searchSchemas"
import { withViewModeSearch } from "@/src/shared/routing/viewModeSearch"
import { projectUploadModalSearchShape } from "@/src/shared/uploads/searchSchemas"

export const DASHBOARD_ALL_PROJECTS = ""
export const DASHBOARD_ALL_MONTHS = 0

// The router reads `?tag=2024` and `?searchterm=2024` as numbers.
const tagSearchParamSchema = z.coerce.string().min(1).optional().catch(undefined)

const dashboardSearchSchema = z.object({
  projectSlug: z.string().default(DASHBOARD_ALL_PROJECTS).catch(DASHBOARD_ALL_PROJECTS),
  months: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(DASHBOARD_ALL_MONTHS)
    .catch(DASHBOARD_ALL_MONTHS),
})

export type DashboardSearch = z.infer<typeof dashboardSearchSchema>

/** On the layout, so one place owns the middlewares. Overlay keys open tasks and documents in place. */
export const dashboardLayoutSearchSchema = withViewModeSearch(
  dashboardSearchSchema.extend(projectRecordModalSearchShape).extend(projectUploadModalSearchShape),
)

export type DashboardLayoutSearch = z.infer<typeof dashboardLayoutSearchSchema>

export const dashboardFilterValues = (search: DashboardSearch) => ({
  projectSlug: search.projectSlug || undefined,
  months: search.months || undefined,
})

export const ASSIGNMENTS_DEFAULTS = { status: "PENDING", direction: "toMe" } as const

export const assignmentsSearchSchema = z.object({
  status: z
    .enum(["all", "PENDING", "COMPLETED"])
    .default(ASSIGNMENTS_DEFAULTS.status)
    .catch(ASSIGNMENTS_DEFAULTS.status),
  direction: z
    .enum(ASSIGNMENT_DIRECTIONS)
    .default(ASSIGNMENTS_DEFAULTS.direction)
    .catch(ASSIGNMENTS_DEFAULTS.direction),
  tag: tagSearchParamSchema,
})

export type AssignmentsSearch = z.infer<typeof assignmentsSearchSchema>

export const ASSIGNMENTS_RESET = { ...ASSIGNMENTS_DEFAULTS, tag: undefined }

export const hasAssignmentsFilter = (search: AssignmentsSearch) =>
  search.status !== ASSIGNMENTS_DEFAULTS.status ||
  search.direction !== ASSIGNMENTS_DEFAULTS.direction ||
  search.tag !== undefined

export const dashboardUploadsSearchSchema = z.object({
  searchterm: z.coerce.string().optional().catch(undefined),
  tag: tagSearchParamSchema,
})

export type DashboardUploadsSearch = z.infer<typeof dashboardUploadsSearchSchema>

export const DASHBOARD_UPLOADS_RESET = { searchterm: undefined, tag: undefined }

export const hasDashboardUploadsFilter = (search: DashboardUploadsSearch) =>
  Boolean(search.searchterm) || search.tag !== undefined
