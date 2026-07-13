import { createFileRoute } from "@tanstack/react-router"
import { PageResetPasswordRoute } from "@/src/components/pages/auth/AuthPages"
import { publicPageHead } from "@/src/routeHead"
import { resetPasswordSearchSchema } from "@/src/shared/auth/searchSchemas"

export const Route = createFileRoute("/auth/reset-password")({
  head: () => publicPageHead("Passwort vergessen"),
  ssr: true,
  validateSearch: resetPasswordSearchSchema,
  component: PageResetPasswordRoute,
})
