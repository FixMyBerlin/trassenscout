import { createFileRoute, redirect } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuthBoundary"
import { dashboardSearchSchema } from "@/src/shared/dashboard/searchSchemas"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/activity/")({
  ssr: true,
  validateSearch: dashboardSearchSchema.pick({ months: true }),
  beforeLoad: ({ params, search }) => {
    endpointAuth.inherited("auth enforced by the project layout")

    throw redirect({
      to: "/dashboard/activity",
      search: { projectSlug: params.projectSlug, months: search.months },
    })
  },
})
