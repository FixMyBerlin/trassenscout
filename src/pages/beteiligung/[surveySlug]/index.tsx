import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import getPublicSurveyBySlug from "src/surveys/queries/getPublicSurveyBySlug"
import ParticipationMainPage from "src/participation/components/rs8"
import ParticipationInactivePage from "src/participation/components/rs8-inactive"
import ParticipationFrm7MainPage from "src/participation-frm7/components/frm7"
import ParticipationFrm7InactivePage from "src/participation-frm7/components/frm7-inactive"

export const Survey = () => {
  const surveySlug = useParam("surveySlug", "string")
  const [survey] = useQuery(getPublicSurveyBySlug, { slug: surveySlug! })
  // only returns something if there is a 'Survey' in the DB with the slug (url params) and the slug is either rs8 or frm7
  if (!survey) return null
  if (surveySlug === "rs8")
    return survey.active ? <ParticipationMainPage /> : <ParticipationInactivePage />
  if (surveySlug === "frm7")
    return survey.active ? <ParticipationFrm7MainPage /> : <ParticipationFrm7InactivePage />
  return null
}

const PublicSurveyPage = () => {
  return (
    <Suspense fallback={<Spinner page />}>
      <Survey />
    </Suspense>
  )
}

export default PublicSurveyPage
