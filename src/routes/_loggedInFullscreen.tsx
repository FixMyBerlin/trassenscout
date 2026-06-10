import { createFileRoute } from "@tanstack/react-router"
import { LayoutOutlet } from "@/src/components/shared/layouts/LayoutOutlet"
import { privateLayoutHead } from "@/src/routeHead"
import { routeSessionFn } from "@/src/server/auth/auth.functions"
export const Route = createFileRoute("/_loggedInFullscreen")({
  ssr: true,
  head: () => privateLayoutHead(),
  beforeLoad: async ({ location }) => {
    const session = await routeSessionFn({ data: location })
    return { session }
  },
  component: LayoutOutlet,
})
