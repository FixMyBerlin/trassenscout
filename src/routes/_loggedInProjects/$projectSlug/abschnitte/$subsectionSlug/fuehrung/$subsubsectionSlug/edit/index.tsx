import { createFileRoute } from "@tanstack/react-router"
import { seoEditTitleSlug } from "@/src/components/core/components/text/titles"
import { PageAbschnitteSubsubsectionEdit } from "@/src/components/pages/abschnitte/PageAbschnitteSubsubsectionEdit"
import { absoluteTitleHead } from "@/src/routeHead"
import { subsubsectionBySlugQueryOptions } from "@/src/server/subsubsections/subsubsectionQueryOptions"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/edit/",
)({
  head: ({ params }) => absoluteTitleHead(seoEditTitleSlug(params.subsubsectionSlug)),
  ssr: true,
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
  component: PageAbschnitteSubsubsectionEdit,
})
