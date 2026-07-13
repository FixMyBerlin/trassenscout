import { createFileRoute } from "@tanstack/react-router"
import { seoNewTitle } from "@/src/components/core/components/text/titles"
import { PageOperatorsNew } from "@/src/components/pages/operators/PageOperatorsNew"
import { absoluteTitleHead } from "@/src/routeHead"
import { operatorMaxOrderQueryOptions } from "@/src/server/operators/operatorMaxOrderQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/operators/new/")({
  head: () => absoluteTitleHead(seoNewTitle("Baulastträger")),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(operatorMaxOrderQueryOptions(params.projectSlug)),
  component: PageOperatorsNew,
})
