import { useQuery } from "@tanstack/react-query"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { myAssignedRecordsCountQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import { projectsWithGeometryWithMembershipRoleQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

/** Aktivitäten follows the rule the log query enforces. Aufgaben is always there, counting open tasks for me. */
export function useDashboardTabs() {
  const { data: user } = useQuery(currentUserQueryOptions())
  const { data: projects = [] } = useQuery(projectsWithGeometryWithMembershipRoleQueryOptions())
  const { data: openTaskCount } = useQuery(myAssignedRecordsCountQueryOptions())

  const isAdmin = user?.role === UserRoleEnum.ADMIN
  const editsAProjectWithLog = projects.some(
    (project) => project.showLogEntries && project.memberships[0]?.role === "EDITOR",
  )

  const tabs: { name: string; to: string; count?: number }[] = [
    { name: "Projekte", to: "/dashboard" },
  ]
  if (isAdmin || editsAProjectWithLog) {
    tabs.push({ name: "Aktivitäten", to: "/dashboard/activity" })
  }
  tabs.push({ name: "Aufgaben", count: openTaskCount, to: "/dashboard/assignments" })

  return tabs
}
