import { createFileRoute } from "@tanstack/react-router"
import { PageAdminProjectRecordEmailsProjectRecordEmailIdEdit } from "@/src/components/pages/admin/project-record-emails/PageAdminProjectRecordEmailsProjectRecordEmailIdEdit"
import { adminTitleHead } from "@/src/routeHead"
import { projectRecordEmailQueryOptions } from "@/src/server/projectRecordEmails/queries/projectRecordEmailsQueryOptions"
import { projectsAdminQueryOptions } from "@/src/server/projects/projectsQueryOptions"

export const Route = createFileRoute("/admin/project-record-emails/$projectRecordEmailId/edit/")({
  head: () => adminTitleHead("Protokoll-E-Mail bearbeiten"),
  ssr: true,
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        projectRecordEmailQueryOptions(Number(params.projectRecordEmailId)),
      ),
      context.queryClient.ensureQueryData(projectsAdminQueryOptions()),
    ]),
  component: PageAdminProjectRecordEmailsProjectRecordEmailIdEdit,
})
