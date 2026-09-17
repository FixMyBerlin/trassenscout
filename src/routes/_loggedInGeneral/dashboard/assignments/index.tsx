import { createFileRoute } from "@tanstack/react-router"
import { PageDashboardAssignments } from "@/src/components/pages/PageDashboardAssignments"
import { privateTitleHead } from "@/src/routeHead"
import { myAssignedRecordsCountQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import { assignmentsSearchSchema } from "@/src/shared/dashboard/searchSchemas"

export const Route = createFileRoute("/_loggedInGeneral/dashboard/assignments/")({
  head: () => privateTitleHead("Aufgaben (Dashboard)"),
  ssr: "data-only",
  validateSearch: assignmentsSearchSchema,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(myAssignedRecordsCountQueryOptions()),
  component: PageDashboardAssignments,
})
