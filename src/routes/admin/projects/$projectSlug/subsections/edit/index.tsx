import { createFileRoute } from "@tanstack/react-router"
import { PageAdminProjectsProjectSlugSubsectionsEdit } from "@/src/components/pages/admin/projects/PageAdminProjectsProjectSlugSubsectionsEdit"
import { adminTitleHead } from "@/src/routeHead"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"

export const Route = createFileRoute("/admin/projects/$projectSlug/subsections/edit/")({
  head: () => adminTitleHead("Planungsabschnitte bearbeiten"),
  ssr: true,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(projectBySlugQueryOptions(params.projectSlug))
    await context.queryClient.ensureQueryData(
      subsectionsQueryOptions({ projectSlug: params.projectSlug }),
    )
  },
  component: PageAdminProjectsProjectSlugSubsectionsEdit,
})
