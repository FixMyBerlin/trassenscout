import { createFileRoute } from "@tanstack/react-router"
import { PageAdminFormTemplates } from "@/src/components/pages/admin/form-templates/PageAdminFormTemplates"
import { adminTitleHead } from "@/src/routeHead"
import { formTemplatesQueryOptions } from "@/src/server/formTemplates/formTemplatesQueryOptions"

export const Route = createFileRoute("/admin/form-templates/")({
  head: () => adminTitleHead("Vorlagen Formulare"),
  ssr: true,
  loader: ({ context }) => context.queryClient.ensureQueryData(formTemplatesQueryOptions()),
  component: PageAdminFormTemplates,
})
