import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import type { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { createdSurveyResponsesQueryOptions } from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import { adminSurveyQueryOptions } from "@/src/server/surveys/surveysQueryOptions"

const routeApi = getRouteApi("/admin/surveys/$surveyId/responses/created/")

export function PageAdminSurveysSurveyIdResponsesCreated() {
  const { surveyId: surveyIdString } = routeApi.useParams()
  const surveyId = Number(surveyIdString)
  const { data: survey } = useSuspenseQuery(adminSurveyQueryOptions(surveyId))
  const { data: createdResponses } = useSuspenseQuery(
    createdSurveyResponsesQueryOptions({ slug: survey.slug as AllowedSurveySlugs }),
  )

  return (
    <>
      <AdminPageHeader
        parent={{
          title: `Beteiligung ${surveyId}`,
          href: `/admin/surveys/${surveyId}/edit`,
        }}
        title="Nicht-abgeschickte Eingaben"
      />
      <p className="mb-4 italic">Dies sind alle Einträge, deren Status CREATED ist.</p>
      {!createdResponses.length
        ? "keine CREATED SurveyResponses gefunden"
        : createdResponses.map((response) => (
            <pre key={response.id}>{JSON.stringify(response, undefined, 2)}</pre>
          ))}
    </>
  )
}
