import { createFileRoute } from "@tanstack/react-router"
import { PageDashboard } from "@/src/components/pages/PageDashboard"
import { RouteMapShellPending } from "@/src/components/pages/RouteMapShellPending"
import { privateTitleHead } from "@/src/routeHead"
import { myAssignedRecordsCountQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import {
  projectDashboardGeometriesQueryOptions,
  projectsWithGeometryWithMembershipRoleQueryOptions,
} from "@/src/server/projects/projectsQueryOptions"
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
      context.queryClient.ensureQueryData(myAssignedRecordsCountQueryOptions()),
    ]),
  pendingComponent: RouteMapShellPending,
  component: PageDashboard,
})
