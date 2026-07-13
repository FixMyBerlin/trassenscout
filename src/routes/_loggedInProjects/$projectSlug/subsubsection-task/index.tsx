import { createFileRoute } from "@tanstack/react-router"
import { PageSubsubsectionTask } from "@/src/components/pages/subsubsection-task/PageSubsubsectionTask"
import { privateTitleHead } from "@/src/routeHead"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/subsubsection-task/")({
  head: () => privateTitleHead("Maßnahmentypen"),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminLookupRowsWithCountQueryOptions({
        projectSlug: params.projectSlug,
        table: "subsubsectionTasks",
      }),
    ),
  component: PageSubsubsectionTask,
})
