import { createFileRoute } from "@tanstack/react-router"
import { PageAdminProjects } from "@/src/components/pages/admin/projects/PageAdminProjects"
import { adminTitleHead } from "@/src/routeHead"
import { adminProjectsWithCountsQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { adminProjectsSearchSchema } from "@/src/shared/projects/searchSchemas"

export const Route = createFileRoute("/admin/projects/")({
  head: () => adminTitleHead("Projekte"),
  ssr: true,
  validateSearch: adminProjectsSearchSchema,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(adminProjectsWithCountsQueryOptions()),
  component: PageAdminProjects,
})
