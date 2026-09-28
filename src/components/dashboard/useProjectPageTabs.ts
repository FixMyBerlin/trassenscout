import { useQuery } from "@tanstack/react-query"
import { getRouteApi, useRouteContext } from "@tanstack/react-router"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import type { MembershipRole } from "@/src/server/authorization/types"
import { myAssignedRecordsCountQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import { projectsForCurrentUserQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

/**
 * Same rule as the dashboard activity tab, for the project that is open.
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

/**
 * Aktivitäten follows the log rule. Aufgaben counts every status in this project, so the tab
 * does not vanish the moment someone finishes their last task.
 */
export function useProjectPageTabs() {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { membershipRole } = useRouteContext({ from: "/_loggedInProjects/$projectSlug" })
  const { data: user } = useQuery(currentUserQueryOptions())
  const { data: projects = [] } = useQuery(projectsForCurrentUserQueryOptions())
  const { data: assignedCount = 0 } = useQuery(myAssignedRecordsCountQueryOptions(projectSlug))

  const project = projects.find((item) => item.slug === projectSlug)
  const tabs: { name: string; to: string }[] = []

  if (
    canSeeProjectActivity({
      role: user?.role,
      membershipRole,
      showLogEntries: project?.showLogEntries,
    })
  ) {
    tabs.push({ name: "Aktivitäten", to: `/${projectSlug}/activity` })
  }
  if (assignedCount > 0) {
    tabs.push({ name: "Aufgaben", to: `/${projectSlug}/assignments` })
  }
  return tabs
}
