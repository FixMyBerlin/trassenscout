import { createFileRoute, redirect } from "@tanstack/react-router"
import { PageProjectRecordsNeedReview } from "@/src/components/pages/project-records/PageProjectRecordsNeedReview"
import { privateTitleHead } from "@/src/routeHead"
import { endpointAuth } from "@/src/server/auth/endpointAuthBoundary"
import { projectRecordsNeedsReviewQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import { projectsForCurrentUserQueryOptions } from "@/src/server/projects/projectsQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/project-records/needreview/")(
  {
    head: () => privateTitleHead("Bestätigung erforderlich - Projektprotokoll"),
    ssr: true,
    beforeLoad: async ({ context, params }) => {
      endpointAuth.inherited("auth enforced by _loggedInProjects layout")
      const projects = await context.queryClient.ensureQueryData(
        projectsForCurrentUserQueryOptions(),
      )
      const project = projects.find((p) => p.slug === params.projectSlug)
      if (!project?.aiEnabled) {
        throw redirect({
          to: "/$projectSlug/project-records",
          params: { projectSlug: params.projectSlug },
        })
      }
    },
    loader: ({ context, params }) =>
      context.queryClient.ensureQueryData(
        projectRecordsNeedsReviewQueryOptions({ projectSlug: params.projectSlug }),
      ),
    component: PageProjectRecordsNeedReview,
  },
)
