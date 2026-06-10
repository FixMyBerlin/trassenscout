import { createFileRoute } from "@tanstack/react-router"
import { PageAdminProjectRecordTemplates } from "@/src/components/pages/admin/project-record-templates/PageAdminProjectRecordTemplates"
import { adminTitleHead } from "@/src/routeHead"
import { projectRecordTemplatesQueryOptions } from "@/src/server/projectRecordTemplates/projectRecordTemplatesQueryOptions"

export const Route = createFileRoute("/admin/project-record-templates/")({
  head: () => adminTitleHead("Vorlagen Protokolleinträge"),
  ssr: true,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(projectRecordTemplatesQueryOptions()),
  component: PageAdminProjectRecordTemplates,
})
