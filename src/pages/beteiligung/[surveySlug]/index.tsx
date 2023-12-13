import { BlitzPage } from "@blitzjs/auth"
import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"

import { surveyDefinition as surveyDefinitionRS8 } from "src/survey-public/rs8/data/survey"
import { surveyDefinition as surveyDefinitionFRM7 } from "src/survey-public/frm7/data/survey"

import SurveyInactivePage from "src/survey-public/components/SurveyInactivePage"
import { SurveyRS8 } from "src/survey-public/rs8/SurveyRS8"
import getPublicSurveyBySlug from "src/surveys/queries/getPublicSurveyBySlug"
import { SurveyFRM7 } from "src/survey-public/frm7/SurveyFRM7"

const PublicSurveyPageWithQuery = () => {
  const surveySlug = useParam("surveySlug", "string")
  const [survey] = useQuery(getPublicSurveyBySlug, { slug: surveySlug! })
  // only returns something if there is a 'Survey' in the DB with the slug (url params) and the slug is either rs8 or frm7
  if (!survey) return null
  if (surveySlug === "rs8")
    return survey.active ? (
      <SurveyRS8 surveyId={survey.id} />
    ) : (
      <SurveyInactivePage surveyDefinition={surveyDefinitionRS8} />
    )
  if (surveySlug === "frm7")
    return survey.active ? (
      <SurveyFRM7 surveyId={survey.id} />
    ) : (
      <SurveyInactivePage surveyDefinition={surveyDefinitionFRM7} />
    )
  return null
}
const PublicSurveyPage: BlitzPage = () => {
  return (
    <Suspense fallback={<Spinner page />}>
      <PublicSurveyPageWithQuery />
    </Suspense>
  )
}

export default PublicSurveyPage
