import { createFileRoute, redirect } from "@tanstack/react-router"
import { seoIndexTitle } from "@/src/components/core/components/text/titles"
import { isPdf } from "@/src/components/core/uploads/getFileType"
import { RouteMapShellPending } from "@/src/components/pages/RouteMapShellPending"
import { PageUploadView } from "@/src/components/pages/uploads/PageUploadView"
import { absoluteTitleHead } from "@/src/routeHead"
import { endpointAuth } from "@/src/server/auth/endpointAuthBoundary"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"

export const Route = createFileRoute("/_loggedInFullscreen/$projectSlug/uploads/$uploadId/view/")({
  head: () => absoluteTitleHead(seoIndexTitle("Dokument ansehen")),
  ssr: "data-only",
  pendingComponent: RouteMapShellPending,
  beforeLoad: async ({ context, params }) => {
    endpointAuth.inherited("auth enforced by _loggedInFullscreen layout")
    const upload = await context.queryClient.ensureQueryData(
      uploadQueryOptions({
        projectSlug: params.projectSlug,
        id: Number(params.uploadId),
      }),
    )

    if (!isPdf(upload)) {
      throw redirect({
        to: "/$projectSlug/uploads",
        params: { projectSlug: params.projectSlug },
      })
    }
  },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      uploadQueryOptions({
        projectSlug: params.projectSlug,
        id: Number(params.uploadId),
      }),
    ),
  component: PageUploadView,
})
