import { createFileRoute } from "@tanstack/react-router"
import { DASHBOARD_BOOKMARKS_LIMIT } from "@/src/components/dashboard/dashboardBookmarks"
import { PageDashboard } from "@/src/components/pages/PageDashboard"
import { RouteMapShellPending } from "@/src/components/pages/RouteMapShellPending"
import { privateTitleHead } from "@/src/routeHead"
import {
  projectDashboardGeometriesQueryOptions,
  projectsForCurrentUserQueryOptions,
  projectsWithGeometryWithMembershipRoleQueryOptions,
} from "@/src/server/projects/projectsQueryOptions"
import { myBookmarkedSubsubsectionsQueryOptions } from "@/src/server/subsubsectionBookmarks/subsubsectionBookmarksQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute("/_loggedInGeneral/dashboard/")({
  head: () => privateTitleHead("Meine Projekte (Dashboard)"),
  ssr: "data-only",
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(currentUserQueryOptions()),
      context.queryClient.ensureQueryData(projectsWithGeometryWithMembershipRoleQueryOptions()),
      context.queryClient.ensureQueryData(projectDashboardGeometriesQueryOptions()),
      context.queryClient.ensureQueryData(projectsForCurrentUserQueryOptions()),
      context.queryClient.ensureQueryData(
        myBookmarkedSubsubsectionsQueryOptions({ limit: DASHBOARD_BOOKMARKS_LIMIT }),
      ),
    ]),
  pendingComponent: RouteMapShellPending,
  component: PageDashboard,
})
