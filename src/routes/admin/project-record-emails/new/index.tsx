import { createFileRoute } from "@tanstack/react-router"
import { PageAdminProjectRecordEmailsNew } from "@/src/components/pages/admin/project-record-emails/PageAdminProjectRecordEmailsNew"
import { adminTitleHead } from "@/src/routeHead"
import { projectsAdminQueryOptions } from "@/src/server/projects/projectsQueryOptions"

export const Route = createFileRoute("/admin/project-record-emails/new/")({
  head: () => adminTitleHead("Neue Protokoll-E-Mail"),
  ssr: true,
  loader: ({ context }) => context.queryClient.ensureQueryData(projectsAdminQueryOptions()),
  component: PageAdminProjectRecordEmailsNew,
})
