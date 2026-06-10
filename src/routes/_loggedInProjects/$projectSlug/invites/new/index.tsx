import { createFileRoute } from "@tanstack/react-router"
import { seoIndexTitle } from "@/src/components/core/components/text/titles"
import { PageInvitesNew } from "@/src/components/pages/invites/PageInvitesNew"
import { absoluteTitleHead } from "@/src/routeHead"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/invites/new/")({
  head: () => absoluteTitleHead(seoIndexTitle("Teammitglied einladen")),
  ssr: true,
  component: PageInvitesNew,
})
