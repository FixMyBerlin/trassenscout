import { createFileRoute, redirect } from "@tanstack/react-router"
import { RouteScopedNotFoundPage } from "@/src/components/shared/errors/RouteNotFoundPage"
import { LayoutLoggedInProject } from "@/src/components/shared/layouts/LayoutNavigation"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { privateLayoutHead } from "@/src/routeHead"
import { getSessionForRouteFn, routeProjectFn } from "@/src/server/auth/auth.functions"
import { projectsForCurrentUserQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { loggedInProjectModalSearchSchema } from "@/src/shared/projectModals/searchSchemas"

function isProjectEditorRoute(pathname: string) {
  return /\/new\/?$/.test(pathname) || /\/edit\/?$/.test(pathname)
}

export const Route = createFileRoute("/_loggedInProjects/$projectSlug")({
  ssr: true,
  head: () => privateLayoutHead(),
  notFoundComponent: RouteScopedNotFoundPage,
  validateSearch: loggedInProjectModalSearchSchema,
  beforeLoad: async ({ params, location }) => {
    const authorization = await routeProjectFn({
      data: { location, projectSlug: params.projectSlug },
    })

    if (isProjectEditorRoute(location.pathname)) {
      const session = await getSessionForRouteFn()
      const canEdit =
        session?.role === UserRoleEnum.ADMIN || authorization.membershipRole === "EDITOR"
      if (!canEdit) {
        throw redirect({
          to: "/access-denied",
          search: { from: location.href },
        })
      }
    }

    return { membershipRole: authorization.membershipRole }
  },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(currentUserQueryOptions()),
      context.queryClient.ensureQueryData(projectsForCurrentUserQueryOptions()),
    ]),
  component: LayoutLoggedInProject,
})
