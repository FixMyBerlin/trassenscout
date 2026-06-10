import { createFileRoute } from "@tanstack/react-router"
import { LayoutAuth } from "@/src/components/shared/layouts/LayoutAuth"
import { privateLayoutHead } from "@/src/routeHead"
import { routeGuestFn } from "@/src/server/auth/auth.functions"

export const Route = createFileRoute("/auth")({
  ssr: true,
  head: () => privateLayoutHead(),
  beforeLoad: async ({ location }) => {
    await routeGuestFn({ data: location })
  },
  component: LayoutAuth,
})
