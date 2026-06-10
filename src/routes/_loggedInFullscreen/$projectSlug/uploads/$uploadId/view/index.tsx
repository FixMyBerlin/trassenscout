import { createFileRoute } from "@tanstack/react-router"
import { seoIndexTitle } from "@/src/components/core/components/text/titles"
import { RouteMapShellPending } from "@/src/components/pages/RouteMapShellPending"
import { PageUploadView } from "@/src/components/pages/uploads/PageUploadView"
import { absoluteTitleHead } from "@/src/routeHead"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"

export const Route = createFileRoute("/_loggedInFullscreen/$projectSlug/uploads/$uploadId/view/")({
  head: () => absoluteTitleHead(seoIndexTitle("Dokument ansehen")),
  ssr: "data-only",
  pendingComponent: RouteMapShellPending,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      uploadQueryOptions({
        projectSlug: params.projectSlug,
        id: Number(params.uploadId),
      }),
    ),
  component: PageUploadView,
})
