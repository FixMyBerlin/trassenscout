import { createFileRoute } from "@tanstack/react-router"
import { PageAdminFormTemplatesTemplateIdEdit } from "@/src/components/pages/admin/form-templates/PageAdminFormTemplatesTemplateIdEdit"
import { adminTitleHead } from "@/src/routeHead"
import { formTemplateQueryOptions } from "@/src/server/formTemplates/formTemplatesQueryOptions"
import { projectsAdminQueryOptions } from "@/src/server/projects/projectsQueryOptions"

export const Route = createFileRoute("/admin/form-templates/$templateId/edit/")({
  head: () => adminTitleHead("Formulartemplate bearbeiten"),
  ssr: true,
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(formTemplateQueryOptions(Number(params.templateId))),
      context.queryClient.ensureQueryData(projectsAdminQueryOptions()),
    ]),
  component: PageAdminFormTemplatesTemplateIdEdit,
})
