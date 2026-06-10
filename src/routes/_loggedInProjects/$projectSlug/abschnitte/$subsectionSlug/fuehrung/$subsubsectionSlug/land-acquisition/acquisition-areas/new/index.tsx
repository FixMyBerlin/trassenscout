import { createFileRoute } from "@tanstack/react-router"
import { longTitle, seoIndexTitle } from "@/src/components/core/components/text/titles"
import { PageAbschnitteAcquisitionAreaNew } from "@/src/components/pages/abschnitte/PageAbschnitteAcquisitionAreaNew"
import { RouteMapShellPending } from "@/src/components/pages/RouteMapShellPending"
import { absoluteTitleHead } from "@/src/routeHead"
import { subsubsectionBySlugQueryOptions } from "@/src/server/subsubsections/subsubsectionQueryOptions"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition/acquisition-areas/new/",
)({
  head: ({ params }) =>
    absoluteTitleHead(
      seoIndexTitle("Verhandlungsflächen erstellen", longTitle(params.subsubsectionSlug)),
    ),
  ssr: "data-only",
  pendingComponent: RouteMapShellPending,
  loader: async ({ context, params }) => {
    const subsubsection = await context.queryClient.ensureQueryData(
      subsubsectionBySlugQueryOptions({
        projectSlug: params.projectSlug,
        subsectionSlug: params.subsectionSlug,
        subsubsectionSlug: params.subsubsectionSlug,
      }),
    )
    return { subsubsection }
  },
  component: PageAbschnitteAcquisitionAreaNew,
})
