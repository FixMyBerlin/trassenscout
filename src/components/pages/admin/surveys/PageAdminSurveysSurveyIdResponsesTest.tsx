import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { DeleteButton } from "@/src/components/admin/surveys/[surveyId]/responses/test/DeleteButton"
import type { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { testSurveyResponsesQueryOptions } from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import { adminSurveyQueryOptions } from "@/src/server/surveys/surveysQueryOptions"

const routeApi = getRouteApi("/admin/surveys/$surveyId/responses/test/")

export function PageAdminSurveysSurveyIdResponsesTest() {
  const { surveyId: surveyIdString } = routeApi.useParams()
  const surveyId = Number(surveyIdString)
  const { data: survey } = useSuspenseQuery(adminSurveyQueryOptions(surveyId))
  const { data: testSurveyResponses } = useSuspenseQuery(
    testSurveyResponsesQueryOptions({ slug: survey.slug as AllowedSurveySlugs }),
  )

  return (
    <>
      <AdminPageHeader
        parent={{
          title: `Beteiligung ${surveyId}`,
          href: `/admin/surveys/${surveyId}/edit`,
        }}
        title="Testeinträge"
      />
      <p className="mb-4 italic">
        Dies sind alle Einträge, deren Hinweistext (ersten 20 Zeichen) &apos;test&apos; enthält
        (plus die jeweils dazugehörige Umfrageteil)
        {survey.slug === "radnetz-brandenburg" && " / die Institution 'FixMyCity' ist"}
      </p>
      {!testSurveyResponses.length
        ? "keine Testeinträge gefunden"
        : testSurveyResponses.map((response) => (
            <pre key={response.id}>{JSON.stringify(response, undefined, 2)}</pre>
          ))}
      {!!testSurveyResponses.length && (
        <DeleteButton
          surveySlug={survey.slug as AllowedSurveySlugs}
          testSurveyResponseIds={testSurveyResponses.map((response) => response.id)}
        />
      )}
    </>
  )
}
