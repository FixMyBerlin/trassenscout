import { useQuery } from "@tanstack/react-query"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { myAssignedRecordsCountQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import { projectsWithGeometryWithMembershipRoleQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

/**
 * Aktivitäten follows the rule the log query enforces. Aufgaben counts every status, so the tab
 * does not vanish the moment someone finishes their last task.
 */
export function useDashboardTabs() {
  const { data: user } = useQuery(currentUserQueryOptions())
  const { data: projects = [] } = useQuery(projectsWithGeometryWithMembershipRoleQueryOptions())
  const { data: assignedCount = 0 } = useQuery(myAssignedRecordsCountQueryOptions())

  const isAdmin = user?.role === UserRoleEnum.ADMIN
  const editsAProjectWithLog = projects.some(
    (project) => project.showLogEntries && project.memberships[0]?.role === "EDITOR",
  )

  const tabs = [{ name: "Projekte", to: "/dashboard" }]
  if (isAdmin || editsAProjectWithLog) {
    tabs.push({ name: "Aktivitäten", to: "/dashboard/activity" })
  }
  if (assignedCount > 0) {
    tabs.push({ name: "Aufgaben", to: "/dashboard/assignments" })
  }

  return tabs
}
