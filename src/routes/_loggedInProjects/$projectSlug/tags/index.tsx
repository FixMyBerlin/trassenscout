import { createFileRoute } from "@tanstack/react-router"
import { PageTags } from "@/src/components/pages/tags/PageTags"
import { privateTitleHead } from "@/src/routeHead"
import { tagsWithUsageCountQueryOptions } from "@/src/server/tags/tagsQueryOptions"
import { fromBackLinkSearchSchema } from "@/src/shared/routing/fromBackLinkSearch"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/tags/")({
  head: () => privateTitleHead("Tags"),
  ssr: true,
  validateSearch: fromBackLinkSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      tagsWithUsageCountQueryOptions({ projectSlug: params.projectSlug, includeArchived: true }),
    ),
  component: PageTags,
})
