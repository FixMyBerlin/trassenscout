import type {
  getAdminProjectsWithCounts,
  getProjectBySlug,
  getProjectsAdmin,
  getProjectsForCurrentUser,
} from "./projects.server"
import type { getProjectsWithGeometryWithMembershipRole } from "./queries/getProjectsWithGeometryWithMembershipRole.server"

export type ProjectsForCurrentUser = Awaited<ReturnType<typeof getProjectsForCurrentUser>>
export type ProjectBySlug = Awaited<ReturnType<typeof getProjectBySlug>>
export type ProjectsAdmin = Awaited<ReturnType<typeof getProjectsAdmin>>
type AdminProjectsWithCounts = Awaited<ReturnType<typeof getAdminProjectsWithCounts>>
export type AdminProjectWithCounts = AdminProjectsWithCounts["projects"][number]
export type ProjectsWithGeometryWithMembershipRole = Awaited<
  ReturnType<typeof getProjectsWithGeometryWithMembershipRole>
>
