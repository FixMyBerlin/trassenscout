import { createFileRoute } from "@tanstack/react-router"
import { PageContactsTeam } from "@/src/components/pages/contacts/PageContactsTeam"
import { privateTitleHead } from "@/src/routeHead"
import { projectUsersQueryOptions } from "@/src/server/memberships/projectUsersQueryOptions"
import { contactsTeamSearchSchema } from "@/src/shared/contacts/searchSchemas"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/contacts/team/")({
  head: () => privateTitleHead("Projektteam"),
  ssr: true,
  validateSearch: contactsTeamSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      projectUsersQueryOptions({ projectSlug: params.projectSlug }),
    ),
  component: PageContactsTeam,
})
