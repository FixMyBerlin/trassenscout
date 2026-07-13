import { createFileRoute } from "@tanstack/react-router"
import { PageSignupRoute } from "@/src/components/pages/auth/AuthPages"
import { publicPageHead } from "@/src/routeHead"
import { authCallbackSearchSchema } from "@/src/shared/auth/searchSchemas"

export const Route = createFileRoute("/auth/signup")({
  head: () => publicPageHead("Registrieren"),
  ssr: true,
  validateSearch: authCallbackSearchSchema,
  component: PageSignupRoute,
})
