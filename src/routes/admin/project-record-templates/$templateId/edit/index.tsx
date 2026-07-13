import { createFileRoute } from "@tanstack/react-router"
import { PageAdminProjectRecordTemplatesTemplateIdEdit } from "@/src/components/pages/admin/project-record-templates/PageAdminProjectRecordTemplatesTemplateIdEdit"
import { adminTitleHead } from "@/src/routeHead"
import {
  projectRecordTemplateQueryOptions,
  tagsAdminQueryOptions,
} from "@/src/server/projectRecordTemplates/projectRecordTemplatesQueryOptions"
import { projectsAdminQueryOptions } from "@/src/server/projects/projectsQueryOptions"

export const Route = createFileRoute("/admin/project-record-templates/$templateId/edit/")({
  head: () => adminTitleHead("Vorlage bearbeiten"),
  ssr: true,
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        projectRecordTemplateQueryOptions(Number(params.templateId)),
      ),
      context.queryClient.ensureQueryData(projectsAdminQueryOptions()),
      context.queryClient.ensureQueryData(tagsAdminQueryOptions()),
    ]),
  component: PageAdminProjectRecordTemplatesTemplateIdEdit,
})
