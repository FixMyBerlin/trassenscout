import { createFileRoute } from "@tanstack/react-router"
import { LayoutAdmin } from "@/src/components/admin/LayoutAdmin"
import { RouteScopedNotFoundPage } from "@/src/components/shared/errors/RouteNotFoundPage"
import { adminLayoutHead } from "@/src/routeHead"
import { adminNavCountsQueryOptions } from "@/src/server/admin/adminNavCountsQueryOptions"
import { routeAdminFn } from "@/src/server/auth/auth.functions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

export const Route = createFileRoute("/admin")({
  ssr: true,
  head: () => adminLayoutHead(),
  notFoundComponent: RouteScopedNotFoundPage,
  beforeLoad: async ({ location }) => {
    const session = await routeAdminFn({ data: location })
    return { session }
  },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(currentUserQueryOptions()),
      context.queryClient.ensureQueryData(adminNavCountsQueryOptions()),
    ]),
  component: LayoutAdmin,
})
