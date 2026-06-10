import { createFileRoute } from "@tanstack/react-router"
import { PageAdminSurveysSurveyIdEdit } from "@/src/components/pages/admin/surveys/PageAdminSurveysSurveyIdEdit"
import { adminTitleHead } from "@/src/routeHead"
import { projectsAdminQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { adminSurveyQueryOptions } from "@/src/server/surveys/surveysQueryOptions"

export const Route = createFileRoute("/admin/surveys/$surveyId/edit/")({
  head: () => adminTitleHead("Beteiligung bearbeiten erstellen"),
  ssr: true,
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(adminSurveyQueryOptions(Number(params.surveyId))),
      context.queryClient.ensureQueryData(projectsAdminQueryOptions()),
    ]),
  component: PageAdminSurveysSurveyIdEdit,
})
