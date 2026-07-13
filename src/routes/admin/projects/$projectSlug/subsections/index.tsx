import { createFileRoute } from "@tanstack/react-router"
import { PageAdminProjectsProjectSlugSubsections } from "@/src/components/pages/admin/projects/PageAdminProjectsProjectSlugSubsections"
import { adminTitleHead } from "@/src/routeHead"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"
import { subsectionAdminSearchSchema } from "@/src/shared/subsections/searchSchemas"

export const Route = createFileRoute("/admin/projects/$projectSlug/subsections/")({
  head: () => adminTitleHead("Planungsabschnitte"),
  ssr: true,
  validateSearch: subsectionAdminSearchSchema,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(projectBySlugQueryOptions(params.projectSlug))
    await context.queryClient.ensureQueryData(
      subsectionsQueryOptions({ projectSlug: params.projectSlug }),
    )
  },
  component: PageAdminProjectsProjectSlugSubsections,
})
