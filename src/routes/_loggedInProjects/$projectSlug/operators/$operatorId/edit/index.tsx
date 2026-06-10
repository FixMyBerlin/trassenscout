import { createFileRoute } from "@tanstack/react-router"
import { seoEditTitle } from "@/src/components/core/components/text/titles"
import { PageOperatorsEdit } from "@/src/components/pages/operators/PageOperatorsEdit"
import { absoluteTitleHead } from "@/src/routeHead"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/operators/$operatorId/edit/")(
  {
    head: () => absoluteTitleHead(seoEditTitle("Baulastträger")),
    ssr: true,
    validateSearch: fromBackLinkSearchSchema,
    loader: ({ context, params }) =>
      context.queryClient.ensureQueryData(
        adminLookupRowQueryOptions({
          projectSlug: params.projectSlug,
          table: "operators",
          id: Number(params.operatorId),
        }),
      ),
    component: PageOperatorsEdit,
  },
)
