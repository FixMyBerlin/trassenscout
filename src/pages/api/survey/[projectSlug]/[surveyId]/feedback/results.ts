import { backendConfig as backendConfigDefault } from "@/src/app/beteiligung/_shared/backend-types"
import { SurveyFieldRadioOrCheckboxGroupConfig } from "@/src/app/beteiligung/_shared/types"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getQuestionIdBySurveySlug"
import { Prettify } from "@/src/core/types"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import getProjectOperators from "@/src/server/operators/queries/getProjectOperators"
import getSurveyResponseTopicsByProject from "@/src/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import { getFlatSurveyQuestions } from "@/src/survey-responses/utils/getQuestionsAsArray"
import getSurveySessionsWithResponses from "@/src/survey-sessions/queries/getSurveySessionsWithResponses"
import { getSession } from "@blitzjs/auth"
import { AuthorizationError } from "blitz"
import { format } from "date-fns"
import { NextApiRequest, NextApiResponse } from "next"
import { coordinatesToWkt } from "../../../utils/coordinatesToWkt"
import { getSurvey, sendCsv } from "./../survey/_shared"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Permissions are checked implicitly by `getSurvey` which will call "@/src/surveys/queries/getSurvey" which uses `authorizeProjectMember`
  const survey = await getSurvey(req, res)
  if (!survey) return

  const surveyDefinition = getConfigBySurveySlug(survey.slug, "part1")
  const feedbackDefinition = getConfigBySurveySlug(survey.slug, "part2")
  const backendDefinition = getConfigBySurveySlug(survey.slug, "backend")
  const metaDefinition = getConfigBySurveySlug(survey.slug, "meta")

  const geometryCategoryId = getQuestionIdBySurveySlug(survey.slug, "geometryCategory")
  const locationId = getQuestionIdBySurveySlug(survey.slug, "location")

  const geometryCategoryType = metaDefinition["geometryCategoryType"]

  const isLocationQuestionId = getQuestionIdBySurveySlug(survey.slug, "enableLocation")

  const feedbackQuestions = getFlatSurveyQuestions(feedbackDefinition)
  const surveyQuestions = getFlatSurveyQuestions(surveyDefinition)

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

  const statusDefinition = backendDefinition.status
  const labels = backendDefinition.labels
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
    "geometry-category": string
  }

  // add headers for all questions
  surveyQuestions.forEach((question) => {
    // @ts-expect-error
    headers.push({ id: question.name, title: question.props.label || question.name })
  })
  feedbackQuestions
    // exclude the "enableLocation" question as it is not explicitley stored in the response data
    .filter((question) => question.name !== String(isLocationQuestionId))
    // the geometry-category question is handled separately
    .forEach((question) => {
      const questionId = String(question.name)
      if (questionId === String(locationId)) {
        headers.push({ id: `${questionId}-lat`, title: "Hinweis Verortung Lat" })
        headers.push({ id: `${questionId}-lng`, title: "Hinweis Verortung Lng" })
      } else {
        // @ts-expect-error
        headers.push({ id: questionId, title: question.props.label || question.name })
      }
    })
  // add headers for all topics
  topics.forEach((topic) => {
    headers.push({
      id: `topic_${topic.id}`,
      title: `${(labels || defaultLabels).topics?.sg}: ${topic.title}`,
    })
  })
  headers.push({ id: "geometry-category", title: "Geometrie-Bezug im WKT-Format" })

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
            surveyQuestions.forEach((question) => {
              const questionId = String(question.name)
              // @ts-expect-error data is of type unknown
              if (surveyPartData[questionId]) {
                switch (question.component) {
                  case "SurveyRadiobuttonGroup":
                    const singleResponseProps =
                      question.props as SurveyFieldRadioOrCheckboxGroupConfig["props"]
                    // @ts-expect-error index type
                    row[questionId] = singleResponseProps.options.find(
                      // @ts-expect-error data is of type unknown
                      (r) => String(r.key) == surveyPartData[questionId],
                    )
                      ? singleResponseProps.options.find(
                          // @ts-expect-error data is of type unknown
                          (r) => String(r.key) === String(surveyPartData[questionId]),
                        )?.label
                      : ""
                    break
                  case "SurveyCheckboxGroup":
                    const multipleResponseResponseProps =
                      question.props as SurveyFieldRadioOrCheckboxGroupConfig["props"]
                    // @ts-expect-error data is of type unknown and index type
                    row[questionId] = !!surveyPartData[questionId].length
                      ? // @ts-expect-error data is of type unknown
                        surveyPartData[questionId]
                          .map(
                            // @ts-ignore todo
                            (resultId) =>
                              multipleResponseResponseProps.options.find(
                                (r) => String(r.key) === String(resultId),
                              )?.label,
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
          feedbackQuestions.forEach((question) => {
            const questionId = String(question.name)
            // @ts-expect-error index type
            if (data[questionId]) {
              switch (question.component) {
                case "SurveyRadiobuttonGroup":
                  const singleResponseProps =
                    question.props as SurveyFieldRadioOrCheckboxGroupConfig["props"]
                  // @ts-expect-error index type
                  row[questionId] = singleResponseProps.options.find(
                    // @ts-expect-error data is of type unknown
                    (r) => String(r.key) == data[questionId],
                  )
                    ? // @ts-expect-error data is of type unknown
                      singleResponseProps.options.find((r) => String(r.key) == data[questionId])
                        ?.label
                    : ""
                  break
                case "SurveyCheckboxGroup":
                  const multipleResponseResponseProps =
                    question.props as SurveyFieldRadioOrCheckboxGroupConfig["props"]
                  // @ts-expect-error index type
                  row[questionId] = data[questionId]
                    ? // @ts-expect-error data is of type unknown
                      data[questionId]
                        .map(
                          (resultId: number) =>
                            multipleResponseResponseProps.options.find(
                              (r) => String(r.key) == String(resultId),
                            )?.label,
                        )
                        .join(" | ")
                    : ""
                  break
                case "SurveySimpleMapWithLegend":
                  // @ts-expect-error data is of type unknown
                  if (questionId === String(locationId) && data[questionId]) {
                    // @ts-expect-error data is of type unknown and index type
                    row[`${questionId}-lat`] = data[questionId].lat
                    // @ts-expect-error data is of type unknown and index type
                    row[`${questionId}-lng`] = data[questionId].lng
                  } else {
                    // @ts-expect-error data is of type unknown and index type
                    row[questionId] = data[questionId]
                      ? // @ts-expect-error data is of type unknown
                        JSON.stringify(data[questionId], null, 2)
                      : ""
                  }
                  break
                // todo
                // case "SurveyGeoCategoryMapWithLegend":
                default:
                  // @ts-expect-error data is of type unknown and index type
                  row[questionId] = data[questionId] || ""
                  break
              }
            }
          })
          // the geometry-category question is handled separately: we need to convert the coordinates to WKT to be able to import them into QGIS

          const categoryCoordinates =
            // @ts-expect-error data is of type unknown and index type
            geometryCategoryId && data[String(geometryCategoryId)]
              ? // @ts-expect-error data is of type unknown and index type
                (JSON.parse(data[String(geometryCategoryId)]) as number[][] | number[][][])
              : // rs8 and frm7 fallback geometry-category
                metaDefinition.geometryFallback

          row["geometry-category"] =
            coordinatesToWkt({
              coordinates: categoryCoordinates,
              type: geometryCategoryType,
            }) || ""

          surveyResponseTopics.forEach((t) => {
            // @ts-expect-error data is of type unknown and index type
            row[`topic_${t.id}`] = "X"
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
