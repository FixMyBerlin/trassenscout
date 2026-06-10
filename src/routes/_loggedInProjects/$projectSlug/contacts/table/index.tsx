import { createFileRoute } from "@tanstack/react-router"
import { PageContactsTable } from "@/src/components/pages/contacts/PageContactsTable"
import { privateTitleHead } from "@/src/routeHead"
import { contactsQueryOptions } from "@/src/server/contacts/contactsQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/contacts/table/")({
  head: () => privateTitleHead("Externe Kontakte bearbeiten & importieren"),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(contactsQueryOptions({ projectSlug: params.projectSlug })),
  component: PageContactsTable,
})
