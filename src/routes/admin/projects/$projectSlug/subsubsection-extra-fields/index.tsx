import { createFileRoute } from "@tanstack/react-router"
import { PageAdminSubsubsectionExtraFieldsProjectSlugEdit } from "@/src/components/pages/admin/subsubsection-extra-fields/PageAdminSubsubsectionExtraFieldsProjectSlugEdit"
import { adminTitleHead } from "@/src/routeHead"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { subsubsectionExtraFieldsProjectsQueryOptions } from "@/src/server/projects/subsubsectionExtraFieldsQueryOptions"

export const Route = createFileRoute("/admin/projects/$projectSlug/subsubsection-extra-fields/")({
  head: ({ params }) => adminTitleHead(`Zusätzliche Felder: ${params.projectSlug}`),
  ssr: true,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(projectBySlugQueryOptions(params.projectSlug)),
      context.queryClient.ensureQueryData(subsubsectionExtraFieldsProjectsQueryOptions()),
    ])
  },
  component: PageAdminSubsubsectionExtraFieldsProjectSlugEdit,
})
