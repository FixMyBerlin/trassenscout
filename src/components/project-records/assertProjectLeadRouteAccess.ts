import type { QueryClient } from "@tanstack/react-query"
import { redirect } from "@tanstack/react-router"
import { userIsProjectLeadOrAdmin } from "@/src/components/shared/app/memberships/hooks/useIsProjectLeadOrAdmin"
import { projectsForCurrentUserQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

export async function assertProjectLeadRouteAccess({
  queryClient,
  projectSlug,
}: {
  queryClient: QueryClient
  projectSlug: string
}) {
  const [user, projects] = await Promise.all([
    queryClient.ensureQueryData(currentUserQueryOptions()),
    queryClient.ensureQueryData(projectsForCurrentUserQueryOptions()),
  ])
  const project = projects.find((p) => p.slug === projectSlug)
  if (!project?.aiEnabled || !userIsProjectLeadOrAdmin(user, project)) {
    throw redirect({ to: "/$projectSlug/project-records", params: { projectSlug } })
  }
}
