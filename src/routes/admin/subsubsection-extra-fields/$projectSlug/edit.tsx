import { createFileRoute, redirect } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuthBoundary"

export const Route = createFileRoute("/admin/subsubsection-extra-fields/$projectSlug/edit")({
  ssr: true,
  beforeLoad: ({ params }) => {
    endpointAuth.inherited("auth enforced by admin layout")
    throw redirect({
      to: "/admin/projects/$projectSlug/subsubsection-extra-fields",
      params: { projectSlug: params.projectSlug },
    })
  },
})
