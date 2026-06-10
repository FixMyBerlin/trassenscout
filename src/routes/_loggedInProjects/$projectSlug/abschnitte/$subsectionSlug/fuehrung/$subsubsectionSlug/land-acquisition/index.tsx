import { createFileRoute, redirect } from "@tanstack/react-router"
import { PageAbschnitteLandAcquisition } from "@/src/components/pages/abschnitte/PageAbschnitteLandAcquisition"
import { RouteMapShellPending } from "@/src/components/pages/RouteMapShellPending"
import { privateTitleHead } from "@/src/routeHead"
import { endpointAuth } from "@/src/server/auth/endpointAuthBoundary"
import { subsectionBySlugQueryOptions } from "@/src/server/subsections/subsectionQueryOptions"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"
import { subsubsectionBySlugQueryOptions } from "@/src/server/subsubsections/subsubsectionQueryOptions"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"
import { landAcquisitionSearchSchema } from "@/src/shared/acquisitionAreas/searchSchemas"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition/",
)({
  head: () => privateTitleHead("Grunderwerb"),
  ssr: "data-only",
  validateSearch: landAcquisitionSearchSchema,
  pendingComponent: RouteMapShellPending,
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
  loader: async ({ context, params }) => {
    const subsection = await context.queryClient.ensureQueryData(
      subsectionBySlugQueryOptions({
        projectSlug: params.projectSlug,
        subsectionSlug: params.subsectionSlug,
      }),
    )
    const [subsections, subsubsection] = await Promise.all([
      context.queryClient.ensureQueryData(
        subsectionsQueryOptions({ projectSlug: params.projectSlug }),
      ),
      context.queryClient.ensureQueryData(
        subsubsectionBySlugQueryOptions({
          projectSlug: params.projectSlug,
          subsectionSlug: params.subsectionSlug,
          subsubsectionSlug: params.subsubsectionSlug,
        }),
      ),
      context.queryClient.ensureQueryData(
        subsubsectionsQueryOptions({
          projectSlug: params.projectSlug,
          subsectionId: subsection.id,
        }),
      ),
    ])
    return { subsection, subsections, subsubsection }
  },
  component: PageAbschnitteLandAcquisition,
})
