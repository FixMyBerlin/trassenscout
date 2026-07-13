import { createFileRoute, redirect } from "@tanstack/react-router"
import { PageAbschnitteLandAcquisition } from "@/src/components/pages/abschnitte/PageAbschnitteLandAcquisition"
import { privateTitleHead } from "@/src/routeHead"
import { endpointAuth } from "@/src/server/auth/endpointAuthBoundary"
import { subsubsectionBySlugQueryOptions } from "@/src/server/subsubsections/subsubsectionQueryOptions"
import { landAcquisitionSearchSchema } from "@/src/shared/acquisitionAreas/searchSchemas"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/_dashboard/land-acquisition/",
)({
  head: () => privateTitleHead("Grunderwerb"),
  ssr: "data-only",
  validateSearch: landAcquisitionSearchSchema,
  beforeLoad: async ({ context, params }) => {
    endpointAuth.inherited("auth enforced by _loggedInProjects layout")
    const subsubsection = await context.queryClient.ensureQueryData(
      subsubsectionBySlugQueryOptions({
        projectSlug: params.projectSlug,
        subsectionSlug: params.subsectionSlug,
        subsubsectionSlug: params.subsubsectionSlug,
      }),
    )
    if (!subsubsection.subsection.project.landAcquisitionModuleEnabled) {
      throw redirect({
        to: "/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug",
        params: {
          projectSlug: params.projectSlug,
          subsectionSlug: params.subsectionSlug,
          subsubsectionSlug: params.subsubsectionSlug,
        },
      })
    }
  },
  component: PageAbschnitteLandAcquisition,
})
