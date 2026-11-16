import { createFileRoute, redirect } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuthBoundary"
import { assignmentsSearchSchema } from "@/src/shared/dashboard/searchSchemas"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/assignments/")({
  ssr: true,
  validateSearch: assignmentsSearchSchema,
  beforeLoad: ({ params, search }) => {
    endpointAuth.inherited("auth enforced by the project layout")

    throw redirect({
      to: "/dashboard/assignments",
      search: {
        projectSlug: params.projectSlug,
        status: search.status,
        direction: search.direction,
        tag: search.tag,
      },
    })
  },
})
