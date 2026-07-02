import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminSurveyResponsesNew } from "@/src/components/admin/surveys/SurveyResponsesNew"
import { Spinner } from "@/src/components/core/components/Spinner"
import { adminSurveyQueryOptions } from "@/src/server/surveys/surveysQueryOptions"

const routeApi = getRouteApi("/admin/surveys/$surveyId/responses/")

export function PageAdminSurveysSurveyIdResponses() {
  const { surveyId: surveyIdString } = routeApi.useParams()
  const surveyId = Number(surveyIdString)
  const { data: survey } = useSuspenseQuery(adminSurveyQueryOptions(surveyId))

  return (
    <>
      <AdminPageHeader
        parent={{
          title: `Beteiligung ${surveyId}`,
          href: `/admin/surveys/${surveyId}/edit`,
        }}
        title={`Eingaben: ${survey.title}`}
      />
      <article className="bg-white p-5">
        <Suspense fallback={<Spinner page />}>
          <AdminSurveyResponsesNew
            projectSlug={survey.project.slug}
            surveyId={surveyId}
            survey={survey}
          />
        </Suspense>
      </article>
    </>
  )
}
