import { createFileRoute } from "@tanstack/react-router"
import { seoEditTitle } from "@/src/components/core/components/text/titles"
import { PageSubsubsectionStatusEdit } from "@/src/components/pages/subsubsection-status/PageSubsubsectionStatusEdit"
import { absoluteTitleHead } from "@/src/routeHead"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/subsubsection-status/$subsubsectionStatusId/edit/",
)({
  head: () => absoluteTitleHead(seoEditTitle("Phase")),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminLookupRowQueryOptions({
        projectSlug: params.projectSlug,
        table: "subsubsectionStatuses",
        id: Number(params.subsubsectionStatusId),
      }),
    ),
  component: PageSubsubsectionStatusEdit,
})
