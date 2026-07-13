import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { Spinner } from "@/src/components/core/components/Spinner"
import { SurveyResponsesMap } from "@/src/components/surveys/[surveyId]/responses/SurveyResponsesMap"
import { surveyQueryOptions } from "@/src/server/surveys/surveysQueryOptions"
import { surveyTabsQueryOptions } from "@/src/server/surveys/surveyTabsQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/surveys/$surveyId/responses/map/")

function PageSurveyResponsesMapContent() {
  const { projectSlug, surveyId } = routeApi.useParams()
  const id = Number(surveyId)
  const { data: survey } = useSuspenseQuery(surveyQueryOptions({ projectSlug, id }))
  const { data: tabs } = useSuspenseQuery(surveyTabsQueryOptions({ projectSlug, surveyId: id }))

  return <SurveyResponsesMap projectSlug={projectSlug} survey={survey} tabs={tabs} />
}

export function PageSurveyResponsesMap() {
  return (
    <Suspense fallback={<Spinner page />}>
      <PageSurveyResponsesMapContent />
    </Suspense>
  )
}
