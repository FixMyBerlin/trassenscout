import { createFileRoute } from "@tanstack/react-router"
import { PageProjectRecordDelete } from "@/src/components/pages/project-records/PageProjectRecordDelete"
import { privateTitleHead } from "@/src/routeHead"
import { projectRecordDeleteInfoQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/project-records/$projectRecordId/delete/",
)({
  head: () => privateTitleHead("Protokolleintrag und verknüpfte Dokumente löschen"),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      projectRecordDeleteInfoQueryOptions({
        projectSlug: params.projectSlug,
        id: Number(params.projectRecordId),
      }),
    ),
  component: PageProjectRecordDelete,
})
