import { createFileRoute } from "@tanstack/react-router"
import { PageAccessDenied } from "@/src/components/pages/PageAccessDenied"
import { privateTitleHead } from "@/src/routeHead"
import { accessDeniedSearchSchema } from "@/src/shared/auth/searchSchemas"

export const Route = createFileRoute("/_loggedInGeneral/access-denied/")({
  head: () => privateTitleHead("Zugriff verweigert"),
  ssr: true,
  validateSearch: accessDeniedSearchSchema,
  component: PageAccessDenied,
})
