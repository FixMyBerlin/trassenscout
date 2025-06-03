import { getConfigBySurveySlug } from "@/src/app/beteiligung-neu/_shared/utils/getConfigBySurveySlug"
import { invoke } from "@/src/blitz-server"
import getFeedbackSurveyResponses from "@/src/survey-responses/queries/getFeedbackSurveyResponses"
import getSurveySurveyResponses from "@/src/survey-responses/queries/getSurveySurveyResponses"
import { getFlatSurveyQuestions } from "@/src/survey-responses/utils/getQuestionsAsArray"
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

  const feedbackQuestions = getFlatSurveyQuestions(getConfigBySurveySlug(survey.slug, "part2"))
  const surveyQuestions = getFlatSurveyQuestions(getConfigBySurveySlug(survey.slug, "part1"))

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
              {Object.entries(data).map(([questionId, answerIds]) => {
                const question = surveyQuestions.find((q) => String(q.name) === String(questionId))

                return (
                  <Fragment key={questionId}>
                    <p className="font-bold" key={questionId}>
                      {question?.props?.label}
                    </p>
                    <p>
                      {question?.component === "SurveyRadiobuttonGroup" &&
                        // @ts-expect-error
                        (question?.props?.responses.find((r) => r.id === Number(answerIds))
                          ? // @ts-expect-error
                            question?.props?.responses.find((r) => r.id === Number(answerIds)).text
                              .de
                          : "ungültig (diese Antwort ist nicht mehr Teil der Konfiguration)")}
                    </p>
                    <p>
                      {question?.component === "SurveyCheckboxGroup" &&
                        // @ts-expect-error
                        question?.props?.responses
                          // we only add this condition for staging; in production the array is never empty
                          // @ts-expect-error
                          .filter((r) => !!answerIds.length && answerIds.includes(r.id))
                          // @ts-expect-error
                          .map((r) => r.text.de + ", ")}
                    </p>
                    <p>
                      {(question?.component === "SurveyTextfield" ||
                        question?.component === "SurveyTextarea" ||
                        question?.component === "SurveyCheckbox") &&
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
                const question = feedbackQuestions.find(
                  (q) => String(q.name) === String(questionId),
                )

                return (
                  <Fragment key={questionId}>
                    <p className="font-bold" key={questionId}>
                      {question?.props.label}
                    </p>

                    <p>
                      {question?.component === "SurveyRadiobuttonGroup" &&
                        // @ts-expect-error
                        (question?.props?.options.find((r) => String(r.id) === String(answerIds))
                          ? // @ts-expect-error
                            question?.props?.options.find((r) => String(r.id) === String(answerIds))
                              .label
                          : "ungültig (diese Antwort ist nicht mehr Teil der Konfiguration)")}
                    </p>
                    <p>
                      {(question?.component === "SurveyTextfield" ||
                        question?.component === "SurveyTextarea" ||
                        question?.component === "SurveyCheckbox") &&
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
