import { createFileRoute } from "@tanstack/react-router"
import { LayoutOutlet } from "@/src/components/shared/layouts/LayoutOutlet"
import { routeSessionFn } from "@/src/server/auth/auth.functions"
export const Route = createFileRoute("/_loggedInProjects")({
  ssr: true,
  beforeLoad: async ({ location }) => {
    const session = await routeSessionFn({ data: location })
    return { session }
  },
  component: LayoutOutlet,
})
