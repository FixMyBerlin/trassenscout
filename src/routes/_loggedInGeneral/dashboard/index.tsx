import { createFileRoute } from "@tanstack/react-router"
import { PageDashboard } from "@/src/components/pages/PageDashboard"
import { RouteMapShellPending } from "@/src/components/pages/RouteMapShellPending"
import { privateTitleHead } from "@/src/routeHead"
import { projectsWithGeometryWithMembershipRoleQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"
import { viewModeSearchMiddlewares, withViewModeSearch } from "@/src/shared/routing/viewModeSearch"

export const Route = createFileRoute("/_loggedInGeneral/dashboard/")({
  head: () => privateTitleHead("Meine Projekte (Dashboard)"),
  ssr: "data-only",
  validateSearch: withViewModeSearch(fromBackLinkSearchSchema),
  search: { middlewares: viewModeSearchMiddlewares },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(currentUserQueryOptions()),
      context.queryClient.ensureQueryData(projectsWithGeometryWithMembershipRoleQueryOptions()),
    ]),
  pendingComponent: RouteMapShellPending,
  component: PageDashboard,
})
