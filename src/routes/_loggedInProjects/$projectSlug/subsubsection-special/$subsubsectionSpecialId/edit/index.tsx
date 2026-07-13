import { createFileRoute } from "@tanstack/react-router"
import { seoEditTitle } from "@/src/components/core/components/text/titles"
import { PageSubsubsectionSpecialEdit } from "@/src/components/pages/subsubsection-special/PageSubsubsectionSpecialEdit"
import { absoluteTitleHead } from "@/src/routeHead"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/subsubsection-special/$subsubsectionSpecialId/edit/",
)({
  head: () => absoluteTitleHead(seoEditTitle("Besonderheit")),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      adminLookupRowQueryOptions({
        projectSlug: params.projectSlug,
        table: "subsubsectionSpecials",
        id: Number(params.subsubsectionSpecialId),
      }),
    ),
  component: PageSubsubsectionSpecialEdit,
})
