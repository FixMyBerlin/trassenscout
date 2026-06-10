import { createFileRoute } from "@tanstack/react-router"
import { LayoutMarketing } from "@/src/components/shared/layouts/LayoutMarketing"
import { routeGuestFn } from "@/src/server/auth/auth.functions"

export const Route = createFileRoute("/_marketing")({
  ssr: true,
  beforeLoad: async ({ location }) => {
    await routeGuestFn({ data: location })
  },
  component: LayoutMarketing,
})
