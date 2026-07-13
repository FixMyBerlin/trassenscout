import { createFileRoute } from "@tanstack/react-router"
import { seoEditTitle } from "@/src/components/core/components/text/titles"
import { PageSubsubsectionInfrastructureTypeEdit } from "@/src/components/pages/subsubsection-infrastructure-type/PageSubsubsectionInfrastructureTypeEdit"
import { absoluteTitleHead } from "@/src/routeHead"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/subsubsection-infrastructure-type/$subsubsectionInfrastructureTypeId/edit/",
)({
  head: () => absoluteTitleHead(seoEditTitle("Gegenstand der Förderung")),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminLookupRowQueryOptions({
        projectSlug: params.projectSlug,
        table: "subsubsectionInfrastructureTypes",
        id: Number(params.subsubsectionInfrastructureTypeId),
      }),
    ),
  component: PageSubsubsectionInfrastructureTypeEdit,
})
