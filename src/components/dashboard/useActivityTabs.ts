import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import type { MembershipRole } from "@/src/server/authorization/types"
import { myAssignedRecordsCountQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import { projectsForCurrentUserQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

const dashboardRouteApi = getRouteApi("/_loggedInGeneral/dashboard")

/**
 * Admins always see the log. Editors see it only when the project shows log entries.
 */
export function canSeeProjectActivity({
  role,
  membershipRole,
  showLogEntries,
}: {
  role: string | undefined
  membershipRole: MembershipRole | null | undefined
  showLogEntries: boolean | undefined
}) {
  if (role === UserRoleEnum.ADMIN) return true
  return membershipRole === "EDITOR" && showLogEntries === true
}

/** The rule the log query enforces, across all projects of the user. */
export function useCanSeeActivity() {
  const { data: user } = useSuspenseQuery(currentUserQueryOptions())
  const { data: projects } = useSuspenseQuery(projectsForCurrentUserQueryOptions())

  return (
    user.role === UserRoleEnum.ADMIN ||
    projects.some((project) =>
      canSeeProjectActivity({
        role: user.role,
        membershipRole: project.memberships[0]?.role,
        showLogEntries: project.showLogEntries,
      }),
    )
  )
}

/** Aktivitäten follows the log rule. Aufgaben is always there, counting my open tasks for the selected project. */
export function useActivityTabs() {
  const { projectSlug } = dashboardRouteApi.useSearch()
  const canSeeActivity = useCanSeeActivity()
  const { data: openTaskCount } = useQuery(
    myAssignedRecordsCountQueryOptions(projectSlug || undefined),
  )

  const tabs: { name: string; to: string; count?: number }[] = []
  if (canSeeActivity) tabs.push({ name: "Aktivitäten", to: "/dashboard/activity" })
  tabs.push({ name: "Aufgaben", count: openTaskCount, to: "/dashboard/assignments" })

  return tabs
}
