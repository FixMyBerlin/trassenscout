import { createFileRoute } from "@tanstack/react-router"
import { PageLoginRoute } from "@/src/components/pages/auth/AuthPages"
import { publicPageHead } from "@/src/routeHead"
import { authCallbackSearchSchema } from "@/src/shared/auth/searchSchemas"

export const Route = createFileRoute("/auth/login")({
  head: () => publicPageHead("Anmelden"),
  ssr: true,
  validateSearch: authCallbackSearchSchema,
  component: PageLoginRoute,
})
