import { createFileRoute } from "@tanstack/react-router"
import { PageDashboardUploads } from "@/src/components/pages/PageDashboardUploads"
import { privateTitleHead } from "@/src/routeHead"
import { myAssignedRecordsCountQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import { projectsWithGeometryWithMembershipRoleQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { dashboardUploadsSearchSchema } from "@/src/shared/dashboard/searchSchemas"

export const Route = createFileRoute("/_loggedInGeneral/dashboard/uploads/")({
  head: () => privateTitleHead("Dokumente (Dashboard)"),
  ssr: "data-only",
  validateSearch: dashboardUploadsSearchSchema,
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(currentUserQueryOptions()),
      context.queryClient.ensureQueryData(projectsWithGeometryWithMembershipRoleQueryOptions()),
      context.queryClient.ensureQueryData(myAssignedRecordsCountQueryOptions()),
    ]),
  component: PageDashboardUploads,
})
