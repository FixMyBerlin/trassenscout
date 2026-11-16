import { createFileRoute } from "@tanstack/react-router"
import { PageDashboardActivity } from "@/src/components/pages/PageDashboardActivity"
import { privateTitleHead } from "@/src/routeHead"
import { logEntriesInfiniteQueryOptions } from "@/src/server/logEntries/logEntriesQueryOptions"
import { myAssignedRecordsCountQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import { projectsWithGeometryWithMembershipRoleQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { dashboardFilterValues } from "@/src/shared/dashboard/searchSchemas"

export const Route = createFileRoute("/_loggedInGeneral/dashboard/activity/")({
  head: () => privateTitleHead("Aktivitäten"),
  ssr: "data-only",
  loaderDeps: ({ search }) => dashboardFilterValues(search),
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(currentUserQueryOptions()),
      context.queryClient.ensureQueryData(projectsWithGeometryWithMembershipRoleQueryOptions()),
      context.queryClient.ensureQueryData(myAssignedRecordsCountQueryOptions(deps.projectSlug)),
      context.queryClient.ensureInfiniteQueryData(logEntriesInfiniteQueryOptions(deps)),
    ]),
  component: PageDashboardActivity,
})
