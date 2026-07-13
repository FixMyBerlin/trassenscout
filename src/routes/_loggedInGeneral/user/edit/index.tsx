import { createFileRoute } from "@tanstack/react-router"
import { PageUserEdit } from "@/src/components/pages/PageUserEdit"
import { privateTitleHead } from "@/src/routeHead"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

export const Route = createFileRoute("/_loggedInGeneral/user/edit/")({
  head: () => privateTitleHead("Profil bearbeiten"),
  ssr: true,
  loader: ({ context }) => context.queryClient.ensureQueryData(currentUserQueryOptions()),
  component: PageUserEdit,
})
