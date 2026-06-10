import { createFileRoute } from "@tanstack/react-router"
import { PageAdminProjectRecordEmails } from "@/src/components/pages/admin/project-record-emails/PageAdminProjectRecordEmails"
import { adminTitleHead } from "@/src/routeHead"
import { projectRecordEmailsQueryOptions } from "@/src/server/projectRecordEmails/queries/projectRecordEmailsQueryOptions"

export const Route = createFileRoute("/admin/project-record-emails/")({
  head: () => adminTitleHead("Protokoll-E-Mails"),
  ssr: true,
  loader: ({ context }) => context.queryClient.ensureQueryData(projectRecordEmailsQueryOptions({})),
  component: PageAdminProjectRecordEmails,
})
