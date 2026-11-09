import { createFileRoute } from "@tanstack/react-router"
import { PageProjectRecordsNeedReview } from "@/src/components/pages/project-records/PageProjectRecordsNeedReview"
import { assertProjectLeadRouteAccess } from "@/src/components/project-records/assertProjectLeadRouteAccess"
import { privateTitleHead } from "@/src/routeHead"
import { endpointAuth } from "@/src/server/auth/endpointAuthBoundary"
import { projectRecordsNeedsReviewQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/project-records/needreview/")(
  {
    head: () => privateTitleHead("Bestätigung erforderlich - Projektprotokoll"),
    ssr: true,
    beforeLoad: async ({ context, params }) => {
      endpointAuth.inherited("auth enforced by _loggedInProjects layout")
      await assertProjectLeadRouteAccess({
        queryClient: context.queryClient,
        projectSlug: params.projectSlug,
      })
    },
    loader: ({ context, params }) =>
      context.queryClient.ensureQueryData(
        projectRecordsNeedsReviewQueryOptions({ projectSlug: params.projectSlug }),
      ),
    component: PageProjectRecordsNeedReview,
  },
)
