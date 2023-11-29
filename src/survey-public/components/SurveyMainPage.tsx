import { BlitzPage } from "@blitzjs/auth"
import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"

import SurveyInactivePage from "src/survey-public/components/SurveyInactivePage"
import getPublicSurveyBySlug from "src/surveys/queries/getPublicSurveyBySlug"
import { SurveyRS8 } from "./SurveyRS8"
import { surveyDefinition as surveyDefinitionRS8 } from "../rs8/data/survey"
import { surveyDefinition as surveyDefinitionFRM7 } from "../frm7/data/survey"
import SurveyFRM7 from "./SurveyFRM7"

const SurveyMainPageWithQuery = () => {
  const surveySlug = useParam("surveySlug", "string")
  const [survey] = useQuery(getPublicSurveyBySlug, { slug: surveySlug! })
  // only returns something if there is a 'Survey' in the DB with the slug (url params) and the slug is either rs8 or frm7
  if (!survey) return null
  if (surveySlug === "rs8")
    return survey.active ? (
      <SurveyRS8 />
    ) : (
      <SurveyInactivePage surveyDefinition={surveyDefinitionRS8} />
    )
  if (surveySlug === "frm7")
    return survey.active ? (
      <SurveyFRM7 />
    ) : (
      <SurveyInactivePage surveyDefinition={surveyDefinitionFRM7} />
    )
  return null
}

const SurveyMainPage: BlitzPage = () => {
  return (
    <Suspense fallback={<Spinner page />}>
      <SurveyMainPageWithQuery />
    </Suspense>
  )
}

export default SurveyMainPage
