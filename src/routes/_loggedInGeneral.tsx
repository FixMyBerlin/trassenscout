import { createFileRoute } from "@tanstack/react-router"
import { RouteScopedNotFoundPage } from "@/src/components/shared/errors/RouteNotFoundPage"
import { LayoutLoggedInGeneral } from "@/src/components/shared/layouts/LayoutNavigation"
import { privateLayoutHead } from "@/src/routeHead"
import { routeSessionFn } from "@/src/server/auth/auth.functions"
import { projectsForCurrentUserQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

export const Route = createFileRoute("/_loggedInGeneral")({
  ssr: true,
  head: () => privateLayoutHead(),
  notFoundComponent: RouteScopedNotFoundPage,
  beforeLoad: async ({ location }) => {
    const session = await routeSessionFn({ data: location })
    return { session }
  },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(currentUserQueryOptions()),
      context.queryClient.ensureQueryData(projectsForCurrentUserQueryOptions()),
    ]),
  component: LayoutLoggedInGeneral,
})
