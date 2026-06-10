import { createFileRoute } from "@tanstack/react-router"
import { seoEditTitle } from "@/src/components/core/components/text/titles"
import { PageAbschnitteAcquisitionAreaEdit } from "@/src/components/pages/abschnitte/PageAbschnitteAcquisitionAreaEdit"
import { RouteMapShellPending } from "@/src/components/pages/RouteMapShellPending"
import { absoluteTitleHead } from "@/src/routeHead"
import { acquisitionAreaQueryOptions } from "@/src/server/acquisitionAreas/acquisitionAreaQueryOptions"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition/acquisition-areas/$acquisitionAreaId/edit/",
)({
  head: () => absoluteTitleHead(seoEditTitle("Verhandlungsfläche")),
  ssr: "data-only",
  pendingComponent: RouteMapShellPending,
  loader: async ({ context, params }) => {
    const acquisitionArea = await context.queryClient.ensureQueryData(
      acquisitionAreaQueryOptions({
        projectSlug: params.projectSlug,
        id: Number(params.acquisitionAreaId),
      }),
    )
    return { acquisitionArea }
  },
  component: PageAbschnitteAcquisitionAreaEdit,
})
