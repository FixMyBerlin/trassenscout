import { createFileRoute } from "@tanstack/react-router"
import { PageContactsContact } from "@/src/components/pages/contacts/PageContactsContact"
import { privateTitleHead } from "@/src/routeHead"
import { contactQueryOptions } from "@/src/server/contacts/contactQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/contacts/$contactId/")({
  head: () => privateTitleHead("Kontakt"),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      contactQueryOptions({ projectSlug: params.projectSlug, id: Number(params.contactId) }),
    ),
  component: PageContactsContact,
})
