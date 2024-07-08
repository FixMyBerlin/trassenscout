import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

import { Spinner } from "src/core/components/Spinner"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import { TFeedbackQuestion, TQuestion } from "src/survey-public/components/types"
import {
  getFeedbackDefinitionBySurveySlug,
  getSurveyDefinitionBySurveySlug,
} from "src/survey-public/utils/getConfigBySurveySlug"
import getFeedbackSurveyResponses from "src/survey-responses/queries/getFeedbackSurveyResponses"
import getSurveySurveyResponses from "src/survey-responses/queries/getSurveySurveyResponses"
import getSurvey from "src/surveys/queries/getSurvey"

export const SurveyResponsesList = () => {
  const router = useRouter()
  const surveyId = useParam("surveyId", "number")
  const [survey] = useQuery(getSurvey, { id: surveyId })
  const [surveyResponses] = useQuery(getSurveySurveyResponses, { surveyId })
  const [feedbackResponses] = useQuery(getFeedbackSurveyResponses, { surveyId })

  const surveyDefinition = getSurveyDefinitionBySurveySlug(survey.slug)
  const feedbackDefinition = getFeedbackDefinitionBySurveySlug(survey.slug)

  const feedbackQuestions: TFeedbackQuestion[] = []

  for (let page of feedbackDefinition.pages) {
    page.questions && feedbackQuestions.push(...page.questions)
  }
  const surveyQuestions: TQuestion[] = []

  for (let page of surveyDefinition.pages) {
    page.questions && surveyQuestions.push(...page.questions)
  }

  return (
    <>
      <h1>{survey.title}</h1>
      <h1>Survey Responses: 1. Teil Umfrage {surveyResponses.length}</h1>

      <ul className="space-y-5">
        {surveyResponses.map(({ id, data, surveySession, surveyPart }) => (
          <div className="border pl-5" key={id}>
            <p>Antwort-Id: {id}</p>
            <p>SurveySesion-Id: {surveySession.id}</p>
            <p>
              Beitrag vom: {surveySession.createdAt.toLocaleDateString()}{" "}
              {surveySession.createdAt.toLocaleTimeString()}
            </p>
            <p>Ergebnisse: </p>
            <p>Rohdaten: {JSON.stringify(data)}</p>
            <p>
              {/*  @ts-expect-error */}
              {Object.entries(data).map(([questionId, answerIds]) => {
                const question = surveyQuestions.find((q) => q.id === Number(questionId))

                return (
                  <>
                    <p className="font-bold" key={questionId}>
                      {question?.label.de}
                    </p>
                    <p>
                      {question?.component === "singleResponse" &&
                        // @ts-expect-error
                        (question?.props?.responses.find((r) => r.id === Number(answerIds))
                          ? // @ts-expect-error
                            question?.props?.responses.find((r) => r.id === Number(answerIds)).text
                              .de
                          : "ungültig (diese Antwort ist nicht mehr Teil der Konfiguration)")}
                    </p>
                    <p>
                      {question?.component === "multipleResponse" &&
                        // @ts-expect-error
                        question?.props?.responses
                          // @ts-expect-error
                          .filter((r) => answerIds.includes(r.id))
                          // @ts-expect-error
                          .map((r) => r.text.de + ", ")}
                    </p>
                    <p>
                      {(question?.component === "textfield" ||
                        question?.component === "text" ||
                        question?.component === "readOnly") &&
                        JSON.stringify(answerIds)}
                    </p>
                  </>
                )
              })}
            </p>
          </div>
        ))}
      </ul>

      <h1>Survey Responses: 2. Teil Hinweise {feedbackResponses.length}</h1>

      <ul className="space-y-5">
        {feedbackResponses.map(({ id, data, surveySession, surveyPart }) => (
          <div className="border pl-5" key={id}>
            <p>Antwort-Id: {id}</p>
            <p>SurveySesion-Id: {surveySession.id}</p>
            <p>
              Beitrag vom: {surveySession.createdAt.toLocaleDateString()}{" "}
              {surveySession.createdAt.toLocaleTimeString()}
            </p>
            <p>
              Ergebnisse:
              {/* @ts-expect-error */}
              {Object.entries(data).map(([questionId, answerIds]) => {
                const question = feedbackQuestions.find((q) => q.id === Number(questionId))

                return (
                  <>
                    <p className="font-bold" key={questionId}>
                      {question?.label.de}
                    </p>

                    <p>
                      {question?.component === "singleResponse" &&
                        // @ts-expect-error
                        (question?.props?.responses.find((r) => r.id === Number(answerIds))
                          ? // @ts-expect-error
                            question?.props?.responses.find((r) => r.id === Number(answerIds)).text
                              .de
                          : "ungültig (diese Antwort ist nicht mehr Teil der Konfiguration)")}
                    </p>
                    <p>
                      {(question?.component === "map" ||
                        question?.component === "text" ||
                        question?.component === "custom") &&
                        JSON.stringify(answerIds)}
                    </p>
                  </>
                )
              })}
            </p>
          </div>
        ))}
      </ul>
    </>
  )
}

const SurveyResponsesPage = () => {
  return (
    <LayoutArticle>
      <MetaTags noindex title="SurveyResponses" />

      <Suspense fallback={<Spinner page />}>
        <SurveyResponsesList />
      </Suspense>
    </LayoutArticle>
  )
}

// See https://github.com/FixMyBerlin/private-issues/issues/936
// SurveyResponsesPage.authenticate = { role: "ADMIN" }
SurveyResponsesPage.authenticate = "ADMINs"

export default SurveyResponsesPage
