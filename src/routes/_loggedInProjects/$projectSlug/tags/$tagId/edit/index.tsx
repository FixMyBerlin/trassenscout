import { createFileRoute } from "@tanstack/react-router"
import { seoEditTitle } from "@/src/components/core/components/text/titles"
import { PageTagsEdit } from "@/src/components/pages/tags/PageTagsEdit"
import { absoluteTitleHead } from "@/src/routeHead"
import { tagsWithUsageCountQueryOptions } from "@/src/server/tags/tagsQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/tags/$tagId/edit/")({
  head: () => absoluteTitleHead(seoEditTitle("Tag")),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      tagsWithUsageCountQueryOptions({
        projectSlug: params.projectSlug,
        includeArchived: true,
      }),
    ),
  component: PageTagsEdit,
})
