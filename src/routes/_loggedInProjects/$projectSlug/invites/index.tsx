import { createFileRoute } from "@tanstack/react-router"
import { seoIndexTitle } from "@/src/components/core/components/text/titles"
import { PageInvites } from "@/src/components/pages/invites/PageInvites"
import { absoluteTitleHead } from "@/src/routeHead"
import { invitesQueryOptions } from "@/src/server/invites/invitesQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/invites/")({
  head: () => absoluteTitleHead(seoIndexTitle("Einladungen")),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(invitesQueryOptions({ projectSlug: params.projectSlug })),
  component: PageInvites,
})
