import { createFileRoute } from "@tanstack/react-router"
import { seoNewTitle } from "@/src/components/core/components/text/titles"
import { PageTagsNew } from "@/src/components/pages/tags/PageTagsNew"
import { absoluteTitleHead } from "@/src/routeHead"
import { tagsWithUsageCountQueryOptions } from "@/src/server/tags/tagsQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/tags/new/")({
  head: () => absoluteTitleHead(seoNewTitle("Tag")),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      tagsWithUsageCountQueryOptions({ projectSlug: params.projectSlug, includeArchived: true }),
    ),
  component: PageTagsNew,
})
