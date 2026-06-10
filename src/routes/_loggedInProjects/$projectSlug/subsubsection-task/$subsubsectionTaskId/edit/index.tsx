import { createFileRoute } from "@tanstack/react-router"
import { seoEditTitle } from "@/src/components/core/components/text/titles"
import { PageSubsubsectionTaskEdit } from "@/src/components/pages/subsubsection-task/PageSubsubsectionTaskEdit"
import { absoluteTitleHead } from "@/src/routeHead"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/subsubsection-task/$subsubsectionTaskId/edit/",
)({
  head: () => absoluteTitleHead(seoEditTitle("Eintragstyp")),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminLookupRowQueryOptions({
        projectSlug: params.projectSlug,
        table: "subsubsectionTasks",
        id: Number(params.subsubsectionTaskId),
      }),
    ),
  component: PageSubsubsectionTaskEdit,
})
