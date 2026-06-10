import { createFileRoute } from "@tanstack/react-router"
import { PageContactsTeam } from "@/src/components/pages/contacts/PageContactsTeam"
import { privateTitleHead } from "@/src/routeHead"
import { projectUsersQueryOptions } from "@/src/server/memberships/projectUsersQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/contacts/team/")({
  head: () => privateTitleHead("Projektteam"),
  ssr: true,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      projectUsersQueryOptions({ projectSlug: params.projectSlug }),
    ),
  component: PageContactsTeam,
})
