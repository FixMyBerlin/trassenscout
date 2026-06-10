import { createFileRoute } from "@tanstack/react-router"
import { LayoutProjectRecords } from "@/src/components/pages/project-records/LayoutProjectRecords"
import { projectRecordsTabCountsQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/project-records")({
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      projectRecordsTabCountsQueryOptions({ projectSlug: params.projectSlug }),
    ),
  component: LayoutProjectRecords,
})
