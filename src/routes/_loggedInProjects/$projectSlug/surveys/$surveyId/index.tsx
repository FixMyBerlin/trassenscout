import { createFileRoute, redirect } from "@tanstack/react-router"
import { absoluteTitleHead } from "@/src/routeHead"
import { endpointAuth } from "@/src/server/auth/endpointAuthBoundary"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/surveys/$surveyId/")({
  head: () => absoluteTitleHead("Beteiligung"),
  ssr: true,
  beforeLoad: ({ params }) => {
    endpointAuth.inherited("auth enforced by _loggedInProjects layout")

    throw redirect({
      to: "/$projectSlug/surveys/$surveyId/responses",
      params,
      replace: true,
    })
  },
})
