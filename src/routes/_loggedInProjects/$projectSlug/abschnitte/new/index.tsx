import { createFileRoute } from "@tanstack/react-router"
import { seoNewTitle } from "@/src/components/core/components/text/titles"
import { PageAbschnitteNew } from "@/src/components/pages/abschnitte/PageAbschnitteNew"
import { absoluteTitleHead } from "@/src/routeHead"
import { subsectionMaxOrderQueryOptions } from "@/src/server/subsections/subsectionMaxOrderQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/abschnitte/new/")({
  head: () => absoluteTitleHead(seoNewTitle("Planungsabschnitt")),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(subsectionMaxOrderQueryOptions(params.projectSlug)),
  component: PageAbschnitteNew,
})
