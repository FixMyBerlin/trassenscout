import { createFileRoute } from "@tanstack/react-router"
import { PageForgotPasswordRoute } from "@/src/components/pages/auth/AuthPages"
import { publicPageHead } from "@/src/routeHead"
import { forgotPasswordSearchSchema } from "@/src/shared/auth/searchSchemas"

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => publicPageHead("Passwort vergessen"),
  ssr: true,
  validateSearch: forgotPasswordSearchSchema,
  component: PageForgotPasswordRoute,
})
