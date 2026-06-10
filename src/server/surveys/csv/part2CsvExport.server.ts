import { format } from "date-fns"
import { backendConfig as backendConfigDefault } from "@/src/components/beteiligung/shared/backend-types"
import type { SurveyFieldRadioOrCheckboxGroupConfig } from "@/src/components/beteiligung/shared/types"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import { getFullname } from "@/src/components/core/users/getFullname"
import { getFlatSurveyFormFields } from "@/src/components/surveys/[surveyId]/responses/getFlatSurveyFormFields"
import { SurveyResponseStateEnum } from "@/src/prisma/generated/client"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { getSurveyResponseTopicsByProject } from "@/src/server/survey-response-topics/surveyResponseTopics.server"
import { coordinatesToWkt } from "./coordinatesToWkt.server"
import { getSurveyForExport } from "./getSurveyForExport.server"
import { sendCsvResponse } from "./sendCsvResponse.server"

type CsvRow = Record<string, string | undefined>

export async function exportPart2ResultsCsv(
  headers: Headers,
  projectSlug: string,
  surveyId: number,
) {
  await endpointAuth.projectRole(headers, projectSlug, viewerRoles)

  const survey = await getSurveyForExport(projectSlug, surveyId)

  const surveyDefinition = getConfigBySurveySlug(survey.slug, "part1")
  const feedbackDefinition = getConfigBySurveySlug(survey.slug, "part2")
  const backendDefinition = getConfigBySurveySlug(survey.slug, "backend")
  const geometryCategoryIdRaw = getQuestionIdBySurveySlug(survey.slug, "geometryCategory")
  const locationId = getQuestionIdBySurveySlug(survey.slug, "location")
  const isLocationQuestionId = getQuestionIdBySurveySlug(survey.slug, "enableLocation")

  const feedbackQuestions = getFlatSurveyFormFields(feedbackDefinition)
  const hasGeometryCategory = feedbackQuestions.some((q) => q.name === geometryCategoryIdRaw)
  const geometryCategoryId = hasGeometryCategory ? geometryCategoryIdRaw : undefined
  const surveyQuestions = getFlatSurveyFormFields(surveyDefinition)

  const [surveySessions, { surveyResponseTopics: topics }, operators] = await Promise.all([
    db.surveySession.findMany({
      where: { surveyId: survey.id },
      include: {
        responses: {
          where: { state: SurveyResponseStateEnum.SUBMITTED },
          include: {
            surveyResponseTopics: true,
            surveyResponseComments: { include: { author: true } },
          },
        },
      },
    }),
    getSurveyResponseTopicsByProject(headers, { projectSlug }),
    db.operator.findMany({
      where: { project: { slug: projectSlug } },
    }),
  ])

  const statusDefinition = backendDefinition.status
  const labels = backendDefinition.labels
  const defaultLabels = backendConfigDefault.labels

  const csvHeaders = [
    { id: "createdAt", title: "Datum" },
    { id: "sessionId", title: "Sitzungs ID" },
    { id: "responseId", title: "Hinweis ID" },
    {
      id: "status",
      title: labels?.status?.sg ? labels.status.sg : defaultLabels.status.sg,
    },
    {
      id: "note",
      title: labels?.note?.sg ? labels.note.sg : defaultLabels.note.sg,
    },
    {
      id: "operator",
      title: labels?.operator?.sg ? labels.operator.sg : defaultLabels.operator.sg,
    },
    {
      id: "comments",
      title: labels?.comment?.pl ? labels.comment.pl : defaultLabels.comment.pl,
    },
  ]

  surveyQuestions.forEach((question) => {
    csvHeaders.push({
      id: String(question.name),
      title: question.props.label || String(question.name),
    })
  })

  feedbackQuestions
    .filter((question) => question.name !== String(isLocationQuestionId))
    .forEach((question) => {
      const questionId = String(question.name)
      if (questionId === String(locationId)) {
        csvHeaders.push({ id: `${questionId}-lat`, title: "Hinweis Verortung Lat" })
        csvHeaders.push({ id: `${questionId}-lng`, title: "Hinweis Verortung Lng" })
      } else {
        csvHeaders.push({ id: questionId, title: question.props.label || question.name })
      }
    })

  topics.forEach((topic) => {
    csvHeaders.push({
      id: `topic_${topic.id}`,
      title: `${(labels || defaultLabels).topics?.sg}: ${topic.title}`,
    })
  })

  if (geometryCategoryId) {
    csvHeaders.push({ id: "geometry-category", title: "Geometrie-Bezug im WKT-Format" })
  }

  const csvData: CsvRow[] = []

  surveySessions.forEach((surveySession) => {
    const { id: sessionId, createdAt, responses } = surveySession

    responses
      .filter((r) => r.surveyPart === 2)
      .forEach(
        ({
          id: responseId,
          data: rawData,
          status,
          operatorId,
          note,
          surveyResponseTopics,
          surveyResponseComments,
        }) => {
          const data = JSON.parse(rawData) as Record<string, unknown>

          const row: CsvRow = {
            createdAt: format(createdAt, "dd.MM.yyyy"),
            sessionId: String(sessionId),
            responseId: String(responseId),
            status:
              status && statusDefinition.find((s) => s.value === status)?.label
                ? statusDefinition.find((s) => s.value === status)!.label
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

          const rawSurveyPartData = responses.find((r) => r.surveyPart === 1)?.data
          if (rawSurveyPartData) {
            const surveyPartData = JSON.parse(rawSurveyPartData) as Record<string, unknown>
            surveyQuestions.forEach((question) => {
              const questionId = String(question.name)
              if (!surveyPartData[questionId]) return

              if (question.component === "SurveyRadiobuttonGroup") {
                const singleResponseProps =
                  question.props as SurveyFieldRadioOrCheckboxGroupConfig["props"]
                row[questionId] = singleResponseProps.options.find(
                  (r) => String(r.key) === String(surveyPartData[questionId]),
                )?.label
              } else if (question.component === "SurveyCheckboxGroup") {
                const multipleResponseProps =
                  question.props as SurveyFieldRadioOrCheckboxGroupConfig["props"]
                const values = surveyPartData[questionId] as number[]
                row[questionId] = values?.length
                  ? values
                      .map(
                        (resultId) =>
                          multipleResponseProps.options.find(
                            (r) => String(r.key) === String(resultId),
                          )?.label,
                      )
                      .join(" | ")
                  : ""
              } else {
                row[questionId] = String(surveyPartData[questionId] ?? "")
              }
            })
          }

          feedbackQuestions.forEach((question) => {
            const questionId = String(question.name)
            if (!data[questionId]) return

            if (question.component === "SurveyRadiobuttonGroup") {
              const singleResponseProps =
                question.props as SurveyFieldRadioOrCheckboxGroupConfig["props"]
              row[questionId] = singleResponseProps.options.find(
                (r) => String(r.key) === String(data[questionId]),
              )?.label
            } else if (question.component === "SurveyCheckboxGroup") {
              const multipleResponseProps =
                question.props as SurveyFieldRadioOrCheckboxGroupConfig["props"]
              const values = data[questionId] as number[]
              row[questionId] = values
                ? values
                    .map(
                      (resultId) =>
                        multipleResponseProps.options.find(
                          (r) => String(r.key) === String(resultId),
                        )?.label,
                    )
                    .join(" | ")
                : ""
            } else if (question.component === "SurveySimpleMapWithLegend") {
              if (questionId === String(locationId) && data[questionId]) {
                const location = data[questionId] as { lat: number; lng: number }
                row[`${questionId}-lat`] = String(location.lat)
                row[`${questionId}-lng`] = String(location.lng)
              } else {
                row[questionId] = data[questionId] ? JSON.stringify(data[questionId], null, 2) : ""
              }
            } else {
              row[questionId] = String(data[questionId] ?? "")
            }
          })

          if (geometryCategoryId) {
            const geometryValue = data[geometryCategoryId]
            row["geometry-category"] = geometryValue
              ? (coordinatesToWkt(String(geometryValue)) ?? "")
              : ""
          }

          surveyResponseTopics.forEach((t) => {
            row[`topic_${t.id}`] = "X"
          })

          csvData.push(row)
        },
      )
  })

  return sendCsvResponse(
    csvHeaders,
    csvData,
    `${format(new Date(), "yyyy-MM-dd")}_beteiligung_teil2_ergebnisse_${survey.slug}.csv`,
  )
}
