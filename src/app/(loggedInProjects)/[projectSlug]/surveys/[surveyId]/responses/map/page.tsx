import { SurveyResponsesMap } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_components/SurveyResponsesMap"
import { getSurveyTabs } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/_utils/getSurveyTabs"
import { invoke } from "@/src/blitz-server"
import { Spinner } from "@/src/core/components/Spinner"
import getSurvey from "@/src/server/surveys/queries/getSurvey"
import { Metadata } from "next"
import { Suspense } from "react"

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

export default async function SurveyResponsesMapPage({
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
    <div className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen pr-2 pl-4">
      <Suspense fallback={<Spinner page />}>
        <SurveyResponsesMap
          projectSlug={params.projectSlug}
          surveyId={Number(params.surveyId)}
          survey={survey}
          tabs={tabs}
        />
      </Suspense>
    </div>
  )
}
