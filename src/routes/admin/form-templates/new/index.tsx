import { createFileRoute } from "@tanstack/react-router"
import { PageAdminFormTemplatesNew } from "@/src/components/pages/admin/form-templates/PageAdminFormTemplatesNew"
import { adminTitleHead } from "@/src/routeHead"

export const Route = createFileRoute("/admin/form-templates/new/")({
  head: () => adminTitleHead("Neues Formulartemplate"),
  ssr: true,
  component: PageAdminFormTemplatesNew,
})
