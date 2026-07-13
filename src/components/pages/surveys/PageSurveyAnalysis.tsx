import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { Spinner } from "@/src/components/core/components/Spinner"
import { SurveyAnalysis } from "@/src/components/surveys/[surveyId]/responses/analysis/SurveyAnalysis"
import { surveyQueryOptions } from "@/src/server/surveys/surveysQueryOptions"
import { surveyTabsQueryOptions } from "@/src/server/surveys/surveyTabsQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/surveys/$surveyId/analysis/")

function PageSurveyAnalysisContent() {
  const { projectSlug, surveyId } = routeApi.useParams()
  const id = Number(surveyId)
  const { data: survey } = useSuspenseQuery(surveyQueryOptions({ projectSlug, id }))
  const { data: tabs } = useSuspenseQuery(surveyTabsQueryOptions({ projectSlug, surveyId: id }))

  return <SurveyAnalysis projectSlug={projectSlug} surveyId={id} survey={survey} tabs={tabs} />
}

export function PageSurveyAnalysis() {
  return (
    <Suspense fallback={<Spinner page />}>
      <PageSurveyAnalysisContent />
    </Suspense>
  )
}
