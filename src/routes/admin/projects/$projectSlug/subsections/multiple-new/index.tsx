import { createFileRoute } from "@tanstack/react-router"
import { PageAdminProjectsProjectSlugSubsectionsMultipleNew } from "@/src/components/pages/admin/projects/PageAdminProjectsProjectSlugSubsectionsMultipleNew"
import { adminTitleHead } from "@/src/routeHead"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"

export const Route = createFileRoute("/admin/projects/$projectSlug/subsections/multiple-new/")({
  head: () => adminTitleHead("Planungsabschnitte im Bulk-Mode hinzufügen"),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(projectBySlugQueryOptions(params.projectSlug)),
  component: PageAdminProjectsProjectSlugSubsectionsMultipleNew,
})
