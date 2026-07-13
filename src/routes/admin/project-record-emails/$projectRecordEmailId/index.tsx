import { createFileRoute } from "@tanstack/react-router"
import { PageAdminProjectRecordEmailsProjectRecordEmailId } from "@/src/components/pages/admin/project-record-emails/PageAdminProjectRecordEmailsProjectRecordEmailId"
import { adminTitleHead } from "@/src/routeHead"
import { projectRecordEmailQueryOptions } from "@/src/server/projectRecordEmails/queries/projectRecordEmailsQueryOptions"

export const Route = createFileRoute("/admin/project-record-emails/$projectRecordEmailId/")({
  head: () => adminTitleHead("Protokoll-E-Mail"),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      projectRecordEmailQueryOptions(Number(params.projectRecordEmailId)),
    ),
  component: PageAdminProjectRecordEmailsProjectRecordEmailId,
})
