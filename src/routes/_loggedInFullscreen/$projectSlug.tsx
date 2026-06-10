import { createFileRoute } from "@tanstack/react-router"
import { LayoutOutlet } from "@/src/components/shared/layouts/LayoutOutlet"
import { routeProjectFn } from "@/src/server/auth/auth.functions"
export const Route = createFileRoute("/_loggedInFullscreen/$projectSlug")({
  ssr: true,
  beforeLoad: async ({ params, location }) => {
    const authorization = await routeProjectFn({
      data: { location, projectSlug: params.projectSlug },
    })
    return { membershipRole: authorization.membershipRole }
  },
  component: LayoutOutlet,
})
