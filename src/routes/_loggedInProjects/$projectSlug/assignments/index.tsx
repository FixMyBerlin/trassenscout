import { createFileRoute } from "@tanstack/react-router"
import { PageProjectAssignments } from "@/src/components/pages/PageProjectAssignments"
import { privateTitleHead } from "@/src/routeHead"
import {
  myAssignedRecordsCountQueryOptions,
  myAssignedRecordsQueryOptions,
} from "@/src/server/projectRecords/projectRecordsQueryOptions"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { assignmentsSearchSchema } from "@/src/shared/dashboard/searchSchemas"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/assignments/")({
  head: () => privateTitleHead("Aufgaben"),
  ssr: true,
  validateSearch: assignmentsSearchSchema,
  loaderDeps: ({ search }) => ({ status: search.status, direction: search.direction }),
  loader: ({ context, params, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(projectBySlugQueryOptions(params.projectSlug)),
      context.queryClient.ensureQueryData(myAssignedRecordsCountQueryOptions(params.projectSlug)),
      context.queryClient.ensureQueryData(
        myAssignedRecordsQueryOptions({
          projectSlug: params.projectSlug,
          direction: deps.direction,
          editingState: deps.status === "all" ? undefined : deps.status,
        }),
      ),
    ]),
  component: PageProjectAssignments,
})
