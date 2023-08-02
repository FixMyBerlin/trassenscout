import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import getSurveyBySlug from "src/surveys/queries/getSurveyBySlug"
import ParticipationMainPage from "src/participation/components/rs8"
import ParticipationInactivePage from "src/participation/components/rs8-inactive"

export const Survey = () => {
  const surveySlug = useParam("surveySlug", "string")
  const [survey] = useQuery(getSurveyBySlug, { slug: surveySlug! })
  return survey.active ? <ParticipationMainPage /> : <ParticipationInactivePage />
}

const PublicSurveyPage = () => {
  return (
    <Suspense fallback={<Spinner page />}>
      <Survey />
    </Suspense>
  )
}

export default PublicSurveyPage
