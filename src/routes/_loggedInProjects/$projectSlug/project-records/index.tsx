import { createFileRoute } from "@tanstack/react-router"
import { PageProjectRecords } from "@/src/components/pages/project-records/PageProjectRecords"
import { privateTitleHead } from "@/src/routeHead"
import { projectRecordsQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import { projectRecordsSearchSchema } from "@/src/shared/projectRecords/searchSchemas"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/project-records/")({
  head: () => privateTitleHead("Projektprotokoll"),
  ssr: true,
  validateSearch: projectRecordsSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      projectRecordsQueryOptions({ projectSlug: params.projectSlug }),
    ),
  component: PageProjectRecords,
})
