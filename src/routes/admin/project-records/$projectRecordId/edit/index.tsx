import { createFileRoute } from "@tanstack/react-router"
import { PageAdminProjectRecordsProjectRecordIdEdit } from "@/src/components/pages/admin/project-records/PageAdminProjectRecordsProjectRecordIdEdit"
import { adminTitleHead } from "@/src/routeHead"
import { projectRecordAdminQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

export const Route = createFileRoute("/admin/project-records/$projectRecordId/edit/")({
  head: () => adminTitleHead("Protokolleintrag bearbeiten"),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      projectRecordAdminQueryOptions(Number(params.projectRecordId)),
    ),
  component: PageAdminProjectRecordsProjectRecordIdEdit,
})
