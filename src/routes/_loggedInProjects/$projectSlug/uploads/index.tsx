import { createFileRoute } from "@tanstack/react-router"
import { PageUploads } from "@/src/components/pages/uploads/PageUploads"
import { privateTitleHead } from "@/src/routeHead"
import { uploadsQueryOptions } from "@/src/server/uploads/uploadsQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/uploads/")({
  head: () => privateTitleHead("Dokumente"),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      uploadsQueryOptions({
        projectSlug: params.projectSlug,
      }),
    ),
  component: PageUploads,
})
