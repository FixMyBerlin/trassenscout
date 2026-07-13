import { createFileRoute } from "@tanstack/react-router"
import { PageLogout } from "@/src/components/pages/auth/AuthPages"
import { publicPageHead } from "@/src/routeHead"

export const Route = createFileRoute("/auth/logout")({
  head: () => publicPageHead("Abmelden"),
  ssr: true,
  component: PageLogout,
})
