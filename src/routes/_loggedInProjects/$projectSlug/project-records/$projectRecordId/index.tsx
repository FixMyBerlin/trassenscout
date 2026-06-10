import { createFileRoute } from "@tanstack/react-router"
import { PageProjectRecordDetail } from "@/src/components/pages/project-records/PageProjectRecordDetail"
import { privateTitleHead } from "@/src/routeHead"
import { projectRecordQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/project-records/$projectRecordId/",
)({
  head: () => privateTitleHead("Protokolleintrag"),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      projectRecordQueryOptions({
        projectSlug: params.projectSlug,
        id: Number(params.projectRecordId),
      }),
    ),
  component: PageProjectRecordDetail,
})
