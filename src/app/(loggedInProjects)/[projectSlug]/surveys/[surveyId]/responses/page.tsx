import { invoke } from "@/src/blitz-server"
import { Spinner } from "@/src/core/components/Spinner"
import getSurvey from "@/src/server/surveys/queries/getSurvey"
import { Metadata } from "next"
import { Suspense } from "react"
import { getSurveyTabs } from "../../_utils/getSurveyTabs"
import { SurveyResponses } from "./_components/SurveyResponses"

export async function generateMetadata({
  params,
}: {
  params: { projectSlug: string; surveyId: string }
}): Promise<Metadata> {
  const survey = await invoke(getSurvey, {
    projectSlug: params.projectSlug,
    id: Number(params.surveyId),
  })

  return {
    title: `Beteiligung ${survey.title}`,
    robots: "noindex",
  }
}

export default async function SurveyResponsesPage({
  params,
}: {
  params: { projectSlug: string; surveyId: string }
}) {
  const survey = await invoke(getSurvey, {
    projectSlug: params.projectSlug,
    id: Number(params.surveyId),
  })
  const tabs = await getSurveyTabs(params.projectSlug, Number(params.surveyId))

  return (
    <Suspense fallback={<Spinner page />}>
      <SurveyResponses
        projectSlug={params.projectSlug}
        surveyId={Number(params.surveyId)}
        survey={survey}
        tabs={tabs}
      />
    </Suspense>
  )
}
