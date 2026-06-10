import { createFileRoute } from "@tanstack/react-router"
import { seoEditTitle } from "@/src/components/core/components/text/titles"
import { PageContactsContactEdit } from "@/src/components/pages/contacts/PageContactsContactEdit"
import { absoluteTitleHead } from "@/src/routeHead"
import { contactQueryOptions } from "@/src/server/contacts/contactQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/contacts/$contactId/edit/")({
  head: () => absoluteTitleHead(seoEditTitle("Kontakt")),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      contactQueryOptions({ projectSlug: params.projectSlug, id: Number(params.contactId) }),
    ),
  component: PageContactsContactEdit,
})
