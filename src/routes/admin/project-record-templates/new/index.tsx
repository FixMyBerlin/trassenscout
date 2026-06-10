import { createFileRoute } from "@tanstack/react-router"
import { PageAdminProjectRecordTemplatesNew } from "@/src/components/pages/admin/project-record-templates/PageAdminProjectRecordTemplatesNew"
import { adminTitleHead } from "@/src/routeHead"

export const Route = createFileRoute("/admin/project-record-templates/new/")({
  head: () => adminTitleHead("Neue Vorlage erstellen"),
  ssr: true,
  component: PageAdminProjectRecordTemplatesNew,
})
