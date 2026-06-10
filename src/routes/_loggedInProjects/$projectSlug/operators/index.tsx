import { createFileRoute } from "@tanstack/react-router"
import { PageOperators } from "@/src/components/pages/operators/PageOperators"
import { privateTitleHead } from "@/src/routeHead"
import { operatorsPaginatedQueryOptions } from "@/src/server/operators/operatorsQueryOptions"
import { operatorsSearchSchema } from "@/src/shared/operators/searchSchemas"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/operators/")({
  head: () => privateTitleHead("Baulastträger"),
  ssr: true,
  validateSearch: operatorsSearchSchema,
  loaderDeps: ({ search: { page, pageSize } }) => ({ page, pageSize }),
  loader: ({ context, params, deps }) =>
    context.queryClient.ensureQueryData(
      operatorsPaginatedQueryOptions({
        projectSlug: params.projectSlug,
        page: deps.page,
        pageSize: deps.pageSize,
      }),
    ),
  component: PageOperators,
})
