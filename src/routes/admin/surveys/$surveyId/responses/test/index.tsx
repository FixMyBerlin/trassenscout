import { createFileRoute, redirect } from "@tanstack/react-router"
import { adminSurveyQueryOptions } from "@/src/server/surveys/surveysQueryOptions"

export const Route = createFileRoute("/admin/surveys/$surveyId/responses/test/")({
  ssr: true,
  loader: async ({ context, params }) => {
    const survey = await context.queryClient.ensureQueryData(
      adminSurveyQueryOptions(Number(params.surveyId)),
    )
    throw redirect({
      to: "/admin/projects/$projectSlug/surveys/$surveyId/responses/test",
      params: { projectSlug: survey.project.slug, surveyId: params.surveyId },
    })
  },
})
