import { Prettify } from "@/src/core/types"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import getProjectOperators from "@/src/server/operators/queries/getProjectOperators"
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
import getSurveyResponseTopicsByProject from "@/src/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import getSurveySessionsWithResponses from "@/src/survey-sessions/queries/getSurveySessionsWithResponses"
import { getSession } from "@blitzjs/auth"
import { AuthorizationError } from "blitz"
import { format } from "date-fns"
import { NextApiRequest, NextApiResponse } from "next"
import { getSurvey, sendCsv } from "./../survey/_shared"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Permissions are checked implicitly by `getSurvey` which will call "@/src/surveys/queries/getSurvey" which uses `authorizeProjectMember`
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

  const err = (status: number, message: string) => {
    res.status(status).json({ error: true, status: status, message })
    res.end()
  }

  let surveySessions: Prettify<Awaited<ReturnType<typeof getSurveySessionsWithResponses>>>
  let topics: Prettify<
    Awaited<ReturnType<typeof getSurveyResponseTopicsByProject>>
  >["surveyResponseTopics"]
  let operators: Prettify<Awaited<ReturnType<typeof getProjectOperators>>>

  try {
    const session = await getSession(req, res)
    // get all surveysessions of survey
    surveySessions = await getSurveySessionsWithResponses(
      // @ts-expect-error
      { projectSlug: req.query.projectSlug, surveyId: survey.id },
      { session },
    )
    // get operators and topics of project
    const surveyResponseTopics = await getSurveyResponseTopicsByProject(
      // @ts-expect-error
      { projectSlug: req.query.projectSlug },
      { session },
    )
    topics = surveyResponseTopics.surveyResponseTopics
    operators = await getProjectOperators(
      // @ts-expect-error
      { projectSlug: req.query.projectSlug },
      { session },
    )
  } catch (e) {
    if (e instanceof AuthorizationError) {
      err(403, "Forbidden")
    }
    // @ts-expect-error
    if (e.code === "P2025" || e instanceof ZodError) {
      err(404, "Not Found")
    }
    console.error(e)
    err(500, "Internal Server Error")
    return
  }

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
    note: string | undefined
    operator: string | undefined
    comments: string | undefined
  }

  // add headers for all questions
  Object.entries(surveyQuestions).forEach(([questionId, question]) => {
    headers.push({ id: questionId, title: question.label.de })
  })
  Object.entries(feedbackQuestions)
    // exclude the "is-location" question as it is not explicitley stored in the response data
    .filter(([questionId]) => questionId !== String(responseConfig.evaluationRefs["is-location"]))
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

          const row: Result = {
            createdAt: format(createdAt, "dd.MM.yyyy"),
            sessionId: String(sessionId),
            responseId: String(responseId),
            // @ts-expect-error ?
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
                            (resultId: number) =>
                              multipleResponseResponseProps.responses.find((r) => r.id === resultId)
                                ?.text.de,
                          )
                          .join(" | ")
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
                          (resultId: number) =>
                            multipleResponseResponseProps.responses.find((r) => r.id === resultId)
                              ?.text.de,
                        )
                        .join(" | ")
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
    `${format(new Date(), "yyyy-MM-dd")}_hinweise_ergebnisse_${survey.slug}.csv`,
  )
}
