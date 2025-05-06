import SurveyInactivePage from "@/src/app/beteiligung-neu/_components/SurveyInactivePage"
import { SurveyRs23Test } from "@/src/app/beteiligung-neu/_rstest-2-3/SurveyRs23Test"
import { SurveyRstest } from "@/src/app/beteiligung-neu/_rstest/SurveyRsTest"
import { AllowedSurveySlugs } from "@/src/app/beteiligung-neu/_shared/utils/allowedSurveySlugs"
import { invoke } from "@/src/blitz-server"
import getPublicSurveyBySlug from "@/src/surveys/queries/getPublicSurveyBySlug"
import { SurveyFRM7 } from "../_frm7-neu/SurveyFRM7NEU"

// todo metadata
// todo loading

export default async function PublicSurveyPage({
  params: { surveySlug },
}: {
  params: { surveySlug: AllowedSurveySlugs }
}) {
  const survey = await invoke(getPublicSurveyBySlug, { slug: surveySlug! })
  // only returns something if there is a 'Survey' in the DB with the slug (url params) and the slug is either rs8 or frm7
  if (!survey) return null

  if (surveySlug === "frm7-neu")
    return survey.active ? (
      <SurveyFRM7 surveyId={survey.id} />
    ) : (
      <SurveyInactivePage surveySlug={surveySlug} />
    )
  if (surveySlug === "rstest")
    return survey.active ? (
      <SurveyRstest surveyId={survey.id} />
    ) : (
      <SurveyInactivePage surveySlug={surveySlug} />
    )
  if (surveySlug === "rstest-2-3")
    return survey.active ? (
      <SurveyRs23Test surveyId={survey.id} />
    ) : (
      <SurveyInactivePage surveySlug={surveySlug} />
    )
  return null
}
