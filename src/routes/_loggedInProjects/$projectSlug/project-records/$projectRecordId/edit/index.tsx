import { createFileRoute } from "@tanstack/react-router"
import { PageProjectRecordEdit } from "@/src/components/pages/project-records/PageProjectRecordEdit"
import { privateTitleHead } from "@/src/routeHead"
import { projectRecordQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/project-records/$projectRecordId/edit/",
)({
  head: () => privateTitleHead("Protokolleintrag bearbeiten"),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      projectRecordQueryOptions({
        projectSlug: params.projectSlug,
        id: Number(params.projectRecordId),
      }),
    ),
  component: PageProjectRecordEdit,
})
