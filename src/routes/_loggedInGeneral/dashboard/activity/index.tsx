import { createFileRoute } from "@tanstack/react-router"
import { PageDashboardActivity } from "@/src/components/pages/PageDashboardActivity"
import { privateTitleHead } from "@/src/routeHead"
import { projectsWithGeometryWithMembershipRoleQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

export const Route = createFileRoute("/_loggedInGeneral/dashboard/activity/")({
  head: () => privateTitleHead("Aktivitäten (Dashboard)"),
  ssr: "data-only",
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(currentUserQueryOptions()),
      context.queryClient.ensureQueryData(projectsWithGeometryWithMembershipRoleQueryOptions()),
    ]),
  component: PageDashboardActivity,
})
