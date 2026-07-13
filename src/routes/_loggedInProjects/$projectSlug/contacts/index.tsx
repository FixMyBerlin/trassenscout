import { createFileRoute } from "@tanstack/react-router"
import { PageContacts } from "@/src/components/pages/contacts/PageContacts"
import { privateTitleHead } from "@/src/routeHead"
import { contactsQueryOptions } from "@/src/server/contacts/contactsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/contacts/")({
  head: () => privateTitleHead("Kontakte"),
  ssr: true,
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        contactsQueryOptions({ projectSlug: params.projectSlug }),
      ),
      context.queryClient.ensureQueryData(currentUserQueryOptions()),
    ]),
  component: PageContacts,
})
