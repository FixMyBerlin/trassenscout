import { createFileRoute } from "@tanstack/react-router"
import { PageProjectDashboard } from "@/src/components/pages/projects/PageProjectDashboard"
import { RouteMapShellPending } from "@/src/components/pages/RouteMapShellPending"
import { privateTitleHead } from "@/src/routeHead"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"
import { projectDashboardSearchSchema } from "@/src/shared/projects/searchSchemas"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/")({
  head: () => privateTitleHead("Projekt"),
  ssr: "data-only",
  pendingComponent: RouteMapShellPending,
  validateSearch: projectDashboardSearchSchema,
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(projectBySlugQueryOptions(params.projectSlug)),
      context.queryClient.ensureQueryData(
        subsectionsQueryOptions({ projectSlug: params.projectSlug }),
      ),
      context.queryClient.ensureQueryData(
        adminLookupRowsWithCountQueryOptions({
          projectSlug: params.projectSlug,
          table: "operators",
        }),
      ),
    ]),
  component: PageProjectDashboard,
})
