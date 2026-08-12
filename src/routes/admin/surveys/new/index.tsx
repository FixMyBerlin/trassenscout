import { createFileRoute, redirect } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuthBoundary"

export const Route = createFileRoute("/admin/surveys/new/")({
  ssr: true,
  beforeLoad: () => {
    endpointAuth.inherited("auth enforced by admin layout")
    throw redirect({ to: "/admin/projects" })
  },
})
