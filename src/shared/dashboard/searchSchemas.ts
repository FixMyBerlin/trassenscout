import { z } from "zod"
import { projectRecordModalSearchShape } from "@/src/shared/projectRecords/searchSchemas"
import { withViewModeSearch } from "@/src/shared/routing/viewModeSearch"

export const DASHBOARD_ALL_PROJECTS = ""
export const DASHBOARD_ALL_MONTHS = 0

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

/** On the layout, so one place owns the middlewares. The overlay keys open a task in place. */
export const dashboardLayoutSearchSchema = withViewModeSearch(
  dashboardSearchSchema.extend(projectRecordModalSearchShape),
)

export type DashboardLayoutSearch = z.infer<typeof dashboardLayoutSearchSchema>

export const dashboardFilterValues = (search: DashboardSearch) => ({
  projectSlug: search.projectSlug || undefined,
  months: search.months || undefined,
})

export const assignmentsSearchSchema = z.object({
  status: z.enum(["all", "PENDING", "COMPLETED"]).default("PENDING").catch("PENDING"),
  direction: z.enum(["all", "byMe", "toMe"]).default("all").catch("all"),
})

export type AssignmentsSearch = z.infer<typeof assignmentsSearchSchema>
