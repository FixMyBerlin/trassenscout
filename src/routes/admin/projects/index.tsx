import { createFileRoute } from "@tanstack/react-router"
import { PageAdminProjects } from "@/src/components/pages/admin/projects/PageAdminProjects"
import { adminTitleHead } from "@/src/routeHead"
import { adminProjectsWithCountsQueryOptions } from "@/src/server/projects/projectsQueryOptions"

export const Route = createFileRoute("/admin/projects/")({
  head: () => adminTitleHead("Projekte"),
  ssr: true,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(adminProjectsWithCountsQueryOptions()),
  component: PageAdminProjects,
})
