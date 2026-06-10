import { createFileRoute } from "@tanstack/react-router"
import { seoEditTitleSlug } from "@/src/components/core/components/text/titles"
import { PageAbschnitteSubsectionEdit } from "@/src/components/pages/abschnitte/PageAbschnitteSubsectionEdit"
import { absoluteTitleHead } from "@/src/routeHead"
import { subsectionBySlugQueryOptions } from "@/src/server/subsections/subsectionQueryOptions"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/edit/",
)({
  head: ({ params }) => absoluteTitleHead(seoEditTitleSlug(params.subsectionSlug)),
  ssr: true,
  loader: async ({ context, params }) => {
    const subsection = await context.queryClient.ensureQueryData(
      subsectionBySlugQueryOptions({
        projectSlug: params.projectSlug,
        subsectionSlug: params.subsectionSlug,
      }),
    )
    return { subsection }
  },
  component: PageAbschnitteSubsectionEdit,
})
