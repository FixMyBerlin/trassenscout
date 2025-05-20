import { invoke } from "@/src/blitz-server"
import { TFeedbackQuestion, TQuestion } from "@/src/survey-public/components/types"
import {
  getFeedbackDefinitionBySurveySlug,
  getSurveyDefinitionBySurveySlug,
} from "@/src/survey-public/utils/getConfigBySurveySlug"
import getFeedbackSurveyResponses from "@/src/survey-responses/queries/getFeedbackSurveyResponses"
import getSurveySurveyResponses from "@/src/survey-responses/queries/getSurveySurveyResponses"
import { Project } from "@prisma/client"
import { Fragment } from "react"

type Props = { project: Project; surveyId: number; survey: any }

export const AdminSurveyResponses = async ({ project, surveyId, survey }: Props) => {
  const surveyResponses = await invoke(getSurveySurveyResponses, {
    projectSlug: project.slug,
    surveyId,
  })
  const feedbackResponses = await invoke(getFeedbackSurveyResponses, {
    projectSlug: project.slug,
    surveyId,
  })

  const feedbackDefinition = getFeedbackDefinitionBySurveySlug(survey.slug)
  const feedbackQuestions: TFeedbackQuestion[] = feedbackDefinition.pages
    .map((page) => page.questions)
    .flat()
    .filter(Boolean)

  const surveyDefinition = getSurveyDefinitionBySurveySlug(survey.slug)
  const surveyQuestions: TQuestion[] = surveyDefinition.pages
    .map((page) => page.questions)
    .flat()
    .filter(Boolean)
  return (
    <>
      <h3>Survey Responses: 1. Teil Umfrage {surveyResponses.length}</h3>

      <ul className="space-y-5">
        {surveyResponses.map(({ id, data, surveySession, surveyPart }) => (
          <li className="border pl-5" key={id}>
            <h4>Antwort-Id: {id}</h4>
            <p>SurveySession-Id: {surveySession.id}</p>
            <p>
              Beitrag vom: {surveySession.createdAt.toLocaleDateString()}{" "}
              {surveySession.createdAt.toLocaleTimeString()}
            </p>
            <p>Ergebnisse: </p>
            <p>Rohdaten: {JSON.stringify(data)}</p>
            <div>
              {/*  @ts-expect-error */}
              {Object.entries(data).map(([questionId, answerIds]) => {
                const question = surveyQuestions.find((q) => q.id === Number(questionId))

                return (
                  <Fragment key={questionId}>
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
                          // we only add this condition for staging; in production the array is never empty
                          // @ts-expect-error
                          .filter((r) => !!answerIds.length && answerIds.includes(r.id))
                          // @ts-expect-error
                          .map((r) => r.text.de + ", ")}
                    </p>
                    <p>
                      {(question?.component === "textfield" ||
                        question?.component === "text" ||
                        question?.component === "readOnly") &&
                        JSON.stringify(answerIds)}
                    </p>
                  </Fragment>
                )
              })}
            </div>
          </li>
        ))}
      </ul>

      <h1>Survey Responses: 2. Teil Hinweise {feedbackResponses.length}</h1>

      <ul className="space-y-5">
        {feedbackResponses.map(({ id, data, surveySession, surveyPart }) => (
          <li className="border pl-5" key={id}>
            <h4>Antwort-Id: {id}</h4>
            <p>SurveySession-Id: {surveySession.id}</p>
            <p>
              Beitrag vom: {surveySession.createdAt.toLocaleDateString()}{" "}
              {surveySession.createdAt.toLocaleTimeString()}
            </p>
            <div>
              Ergebnisse:
              {/* @ts-expect-error */}
              {Object.entries(data).map(([questionId, answerIds]) => {
                const question = feedbackQuestions.find((q) => q.id === Number(questionId))

                return (
                  <Fragment key={questionId}>
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
                  </Fragment>
                )
              })}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
