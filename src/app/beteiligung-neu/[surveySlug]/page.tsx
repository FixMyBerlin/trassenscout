import SurveyInactivePage from "@/src/app/beteiligung-neu/_components/SurveyInactivePage"

import { SurveyRsTest23 } from "@/src/app/beteiligung-neu/_rstest-2-3/SurveyRsTest23"

import { SurveyRsTest123 } from "@/src/app/beteiligung-neu/_rstest-1-2-3/SurveyRsTest123"
import { SurveyRsTest1 } from "@/src/app/beteiligung-neu/_rstest-1/SurveyRsTest1"
import { SurveyRsTest2 } from "@/src/app/beteiligung-neu/_rstest-2/SurveyRsTest2"
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

  if (!survey.active) {
    return <SurveyInactivePage surveySlug={surveySlug} />
  } else {
    if (surveySlug === "frm7-neu") return <SurveyFRM7 surveyId={survey.id} />
    if (surveySlug === "rstest-1-2-3") return <SurveyRsTest123 surveyId={survey.id} />
    if (surveySlug === "rstest-2-3") return <SurveyRsTest23 surveyId={survey.id} />
    if (surveySlug === "rstest-2") return <SurveyRsTest2 surveyId={survey.id} />
    if (surveySlug === "rstest-1") return <SurveyRsTest1 surveyId={survey.id} />
    return null
  }
}
