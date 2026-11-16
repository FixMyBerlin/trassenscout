import { createFileRoute } from "@tanstack/react-router"
import { PageDashboardAssignments } from "@/src/components/pages/PageDashboardAssignments"
import { privateTitleHead } from "@/src/routeHead"
import {
  myAssignedRecordsCountQueryOptions,
  myAssignedRecordsQueryOptions,
} from "@/src/server/projectRecords/projectRecordsQueryOptions"
import { projectsWithGeometryWithMembershipRoleQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { assignmentsSearchSchema } from "@/src/shared/dashboard/searchSchemas"

export const Route = createFileRoute("/_loggedInGeneral/dashboard/assignments/")({
  head: () => privateTitleHead("Aufgaben"),
  ssr: "data-only",
  validateSearch: assignmentsSearchSchema,
  loaderDeps: ({ search }) => ({
    projectSlug: search.projectSlug || undefined,
    status: search.status,
    direction: search.direction,
  }),
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(currentUserQueryOptions()),
      context.queryClient.ensureQueryData(projectsWithGeometryWithMembershipRoleQueryOptions()),
      context.queryClient.ensureQueryData(myAssignedRecordsCountQueryOptions(deps.projectSlug)),
      context.queryClient.ensureQueryData(
        myAssignedRecordsQueryOptions({
          projectSlug: deps.projectSlug,
          direction: deps.direction,
          editingState: deps.status === "all" ? undefined : deps.status,
        }),
      ),
    ]),
  component: PageDashboardAssignments,
})
