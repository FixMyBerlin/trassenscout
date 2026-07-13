import { createFileRoute } from "@tanstack/react-router"
import { seoEditTitle } from "@/src/components/core/components/text/titles"
import { PageSubsubsectionInfraEdit } from "@/src/components/pages/subsubsection-infra/PageSubsubsectionInfraEdit"
import { absoluteTitleHead } from "@/src/routeHead"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/subsubsection-infra/$subsubsectionInfraId/edit/",
)({
  head: () => absoluteTitleHead(seoEditTitle("Führungsform")),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminLookupRowQueryOptions({
        projectSlug: params.projectSlug,
        table: "subsubsectionInfras",
        id: Number(params.subsubsectionInfraId),
      }),
    ),
  component: PageSubsubsectionInfraEdit,
})
