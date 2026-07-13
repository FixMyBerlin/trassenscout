import { createFileRoute } from "@tanstack/react-router"
import { seoNewTitle } from "@/src/components/core/components/text/titles"
import { PageContactsNew } from "@/src/components/pages/contacts/PageContactsNew"
import { absoluteTitleHead } from "@/src/routeHead"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/contacts/new/")({
  head: () => absoluteTitleHead(seoNewTitle("Kontakt")),
  ssr: true,
  component: PageContactsNew,
})
