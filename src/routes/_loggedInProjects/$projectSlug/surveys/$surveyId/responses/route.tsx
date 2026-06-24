import { createFileRoute, Outlet } from "@tanstack/react-router"
import { surveyResponsesSearchSchema } from "@/src/shared/survey-responses/searchSchemas"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/surveys/$surveyId/responses")(
  {
    validateSearch: surveyResponsesSearchSchema,
    component: Outlet,
  },
)
