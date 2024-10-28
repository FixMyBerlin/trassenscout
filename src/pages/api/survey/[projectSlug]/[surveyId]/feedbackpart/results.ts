import db from "@/db"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import {
  TFeedback,
  TFeedbackQuestion,
  TQuestion,
  TSingleOrMultiResponseProps,
  TSurvey,
} from "@/src/survey-public/components/types"
import { backendConfig as backendConfigDefault } from "@/src/survey-public/utils/backend-config-defaults"
import {
  getBackendConfigBySurveySlug,
  getFeedbackDefinitionBySurveySlug,
  getResponseConfigBySurveySlug,
  getSurveyDefinitionBySurveySlug,
} from "@/src/survey-public/utils/getConfigBySurveySlug"
import { NextApiRequest, NextApiResponse } from "next"
import { getSurvey, sendCsv } from "./../surveypart/_shared"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const survey = await getSurvey(req, res)
  if (!survey) return

  const surveyDefinition = getSurveyDefinitionBySurveySlug(survey.slug)
  const feedbackDefinition = getFeedbackDefinitionBySurveySlug(survey.slug)
  const backendConfig = getBackendConfigBySurveySlug(survey.slug)
  const responseConfig = getResponseConfigBySurveySlug(survey.slug)

  const getQuestions = (definition: TSurvey | TFeedback) => {
    const questions: Record<string, TQuestion | TFeedbackQuestion> = {}
    definition.pages.forEach((page) => {
      if (!page.questions) return
      page.questions.forEach((question) => {
        questions[question.id] = question
      })
    })
    return questions
  }

  const surveyQuestions = getQuestions(surveyDefinition) as Record<string, TQuestion>
  const feedbackQuestions = getQuestions(feedbackDefinition) as Record<string, TFeedbackQuestion>

  // get all surveysessions for the survey
  const surveySessions = await db.surveySession.findMany({
    where: { surveyId: survey.id },
    include: {
      responses: {
        include: {
          surveyResponseTopics: true,
          surveyResponseComments: { include: { author: true } },
        },
      },
    },
  })

  // get all operators for project
  const operators = await db.operator.findMany({
    where: { projectId: survey.projectId },
  })

  // get all topics for project
  const topics = await db.surveyResponseTopic.findMany({ where: { projectId: survey.projectId } })

  const statusDefinition = backendConfig.status

  const labels = backendConfig.labels
  const defaultLabels = backendConfigDefault.labels

  const headers = [
    { id: "createdAt", title: "Datum" },
    { id: "sessionId", title: "Sitzungs ID" },
    { id: "responseId", title: "Hinweis ID" },
    {
      id: "status",
      title: labels && labels["status"]?.sg ? labels["status"]?.sg : defaultLabels["status"].sg,
    },
    {
      id: "note",
      title: labels && labels["note"]?.sg ? labels["note"]?.sg : defaultLabels["note"].sg,
    },
    {
      id: "operator",
      title:
        labels && labels["operator"]?.sg ? labels["operator"]?.sg : defaultLabels["operator"].sg,
    },
    { id: "comments", title: "Kommentare" },
  ]

  type Result = {
    createdAt: string
    sessionId: string
    responseId: string
    status: string
    note?: string
    operator?: string
    comments?: string
  }

  // add headers for all questions
  Object.entries(surveyQuestions).forEach(([questionId, question]) => {
    headers.push({ id: questionId, title: question.label.de })
  })
  Object.entries(feedbackQuestions)
    // exclude the "is-feedback-location" question as it is not explicitley stored in the response data
    .filter(
      ([questionId]) =>
        questionId !== String(responseConfig.evaluationRefs["is-feedback-location"]),
    )
    .forEach(([questionId, question]) => {
      headers.push({ id: questionId, title: question.label.de })
    })
  // add headers for all topics
  topics.forEach((topic) => {
    headers.push({
      id: `topic_${topic.id}`,
      title: `${(labels || defaultLabels).topics?.sg}: ${topic.title}`,
    })
  })

  const csvData: Result[] = []

  surveySessions.forEach((surveySession) => {
    const { id: sessionId, createdAt, responses } = surveySession

    responses
      // create a row for each feedback part / "Hinweis"
      .filter((r) => r.surveyPart === 2)
      .forEach(
        ({
          id: responseId,
          data,
          status,
          operatorId,
          note,
          surveyResponseTopics,
          surveyResponseComments,
        }) => {
          // @ts-expect-error data is of type unknown
          data = JSON.parse(data)

          let row: Result = {
            createdAt: createdAt.toLocaleDateString("de-DE"),
            sessionId: String(sessionId),
            responseId: String(responseId),
            // @ts-ignore ?
            status:
              // statusDefinition.find((s) => s.value === status) is only undefined if the status config is changed after the survey is live, this should not happen in production
              status && statusDefinition.find((s) => s.value === status)?.label
                ? statusDefinition.find((s) => s.value === status)?.label
                : "invalid status",
            note: note || undefined,
            operator: operatorId ? operators.find((o) => o.id === operatorId)?.title : undefined,
            comments: surveyResponseComments
              .map(
                (c) =>
                  getFullname(c.author) +
                  " (" +
                  c.createdAt.toLocaleDateString("de-DE") +
                  "): " +
                  c.body,
              )
              .join(", \n"),
          }
          // for each row / "Hinweis" / feedback part include the data from the matching survey part
          const rawSurveyPartData = responses.find((r) => r.surveyPart === 1)?.data
          if (rawSurveyPartData) {
            const surveyPartData = JSON.parse(rawSurveyPartData)
            Object.entries(surveyQuestions).forEach(([questionId, question]) => {
              // @ts-expect-error data is of type unknown
              if (surveyPartData[questionId]) {
                switch (question.component) {
                  case "singleResponse":
                    const singleResponseProps = question.props as TSingleOrMultiResponseProps
                    // @ts-expect-error index type
                    row[questionId] = singleResponseProps.responses.find(
                      // @ts-expect-error data is of type unknown
                      (r) => r.id === surveyPartData[questionId],
                    )
                      ? singleResponseProps.responses.find(
                          // @ts-expect-error data is of type unknown
                          (r) => r.id === surveyPartData[questionId],
                        )?.text.de
                      : ""
                    break
                  case "multipleResponse":
                    const multipleResponseResponseProps =
                      question.props as TSingleOrMultiResponseProps
                    // @ts-expect-error data is of type unknown and index type
                    row[questionId] = !!surveyPartData[questionId].length
                      ? // @ts-expect-error data is of type unknown
                        surveyPartData[questionId]
                          .map(
                            (resultId: string) =>
                              multipleResponseResponseProps.responses.find(
                                (r) => String(r.id) === resultId,
                              )?.text.de,
                          )
                          .join(", ")
                      : ""
                    break
                  default:
                    // @ts-expect-error data is of type unknown and index type
                    row[questionId] = surveyPartData[questionId] || ""
                    break
                }
              }
            })
          }
          Object.entries(feedbackQuestions).forEach(([questionId, question]) => {
            // @ts-expect-error index type
            if (data[questionId]) {
              switch (question.component) {
                case "singleResponse":
                  const singleResponseProps = question.props as TSingleOrMultiResponseProps
                  // @ts-expect-error index type
                  row[questionId] = singleResponseProps.responses.find(
                    // @ts-expect-error data is of type unknown
                    (r) => r.id === data[questionId],
                  )
                    ? // @ts-expect-error data is of type unknown
                      singleResponseProps.responses.find((r) => r.id === data[questionId])?.text.de
                    : ""
                  break
                case "multipleResponse":
                  const multipleResponseResponseProps =
                    question.props as TSingleOrMultiResponseProps
                  // @ts-expect-error index type
                  row[questionId] = data[questionId]
                    ? // @ts-expect-error data is of type unknown
                      data[questionId]
                        .map(
                          // @ts-expect-error index type
                          (resultId) =>
                            multipleResponseResponseProps.responses.find((r) => r.id === resultId)
                              ?.text.de,
                        )
                        .join(", ")
                    : ""
                  break
                case "map":
                  // @ts-expect-error data is of type unknown and index type
                  row[questionId] = data[questionId]
                    ? // @ts-expect-error data is of type unknown
                      JSON.stringify(data[questionId], null, 2)
                    : ""
                  break
                default:
                  // @ts-expect-error data is of type unknown and index type
                  row[questionId] = data[questionId] || ""
                  break
              }
            }
          })
          surveyResponseTopics.forEach((t) => {
            // @ts-expect-error index type
            row[`topic_${t.surveyResponseTopicId}`] = "X"
          })
          csvData.push(row)
        },
      )
  })

  sendCsv(
    res,
    headers,
    csvData,
    `ergebnisse_${survey.slug}_${new Date().toLocaleDateString("de-DE")}.csv`,
  )
}
