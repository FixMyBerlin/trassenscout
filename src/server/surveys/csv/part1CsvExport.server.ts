import { format } from "date-fns"
import type { SurveyFieldRadioOrCheckboxGroupConfig } from "@/src/components/beteiligung/shared/types"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { getSurveyForExport } from "./getSurveyForExport.server"
import { sendCsvResponse } from "./sendCsvResponse.server"

const translatedComponentTypes = {
  SurveyCheckboxGroup: "mehrfach",
  SurveyNumberfield: "zahl",
  SurveyResponseIdField: "antwort_id",
  SurveyRadiobuttonGroup: "einfach",
  SurveySelect: "einfach",
  SurveyTextfield: "text",
  SurveyTextarea: "text",
  SurveySimpleMapWithLegend: "geo",
  SurveyGeoCategoryMapWithLegend: "geo",
  SwitchableMap: "geo",
  SurveyReadonlyTextfield: "text readonly",
  SurveyCheckbox: "bool",
  SurveyUploadField: "uploads",
  hidden: "hidden",
} as const

export async function exportPart1QuestionsCsv(
  headers: Headers,
  projectSlug: string,
  surveyId: number,
) {
  await endpointAuth.projectRole(headers, projectSlug, viewerRoles)

  const survey = await getSurveyForExport(projectSlug, surveyId)

  const surveyDefinition = getConfigBySurveySlug(survey.slug, "part1")
  if (!surveyDefinition) {
    return Response.json({ error: "Umfrageteil 1 nicht gefunden" }, { status: 404 })
  }

  const csvHeaders = [
    { id: "id", title: "frage_id" },
    { id: "type", title: "typ" },
    { id: "question", title: "frage" },
  ]

  type Question = { id: number | string; type: string; question: string }
  const data: Question[] = []

  surveyDefinition.pages.forEach((page) => {
    page.fields
      .filter((f) => f.componentType === "form")
      .forEach(({ name, component, props }) => {
        const componentType =
          translatedComponentTypes[component as keyof typeof translatedComponentTypes] ||
          "text readonly"
        data.push({
          id: name,
          type: componentType,
          question: props.label || "",
        })
      })
  })

  return sendCsvResponse(
    csvHeaders,
    data,
    `${format(new Date(), "yyyy-MM-dd")}_beteiligung_teil1_fragen_${survey.slug}.csv`,
  )
}

export async function exportPart1AnswersCsv(
  headers: Headers,
  projectSlug: string,
  surveyId: number,
) {
  await endpointAuth.projectRole(headers, projectSlug, viewerRoles)

  const survey = await getSurveyForExport(projectSlug, surveyId)

  const surveyDefinition = getConfigBySurveySlug(survey.slug, "part1")
  if (!surveyDefinition) {
    return Response.json({ error: "Umfrageteil 1 nicht gefunden" }, { status: 404 })
  }

  const csvHeaders = [
    { id: "questionId", title: "frage_id" },
    { id: "responseId", title: "antwort_id" },
    { id: "text", title: "antwort" },
  ]

  type Question = { questionId: number | string; responseId: number | string; text: string }
  const data: Question[] = []

  surveyDefinition.pages.forEach((page) => {
    page.fields
      .filter((f) => ["SurveyCheckboxGroup", "SurveyRadiobuttonGroup"].includes(f.component))
      .forEach((field) => {
        const fieldProps = field.props as SurveyFieldRadioOrCheckboxGroupConfig["props"]
        fieldProps.options.forEach((response) => {
          data.push({
            questionId: field.name,
            responseId: response.key,
            text: response.label,
          })
        })
      })
  })

  return sendCsvResponse(
    csvHeaders,
    data,
    `${format(new Date(), "yyyy-MM-dd")}_beteiligung_teil1_antworten_${survey.slug}.csv`,
  )
}

export async function exportPart1ResultsCsv(
  headers: Headers,
  projectSlug: string,
  surveyId: number,
) {
  await endpointAuth.projectRole(headers, projectSlug, viewerRoles)

  const survey = await getSurveyForExport(projectSlug, surveyId)

  const surveyDefinition = getConfigBySurveySlug(survey.slug, "part1")
  if (!surveyDefinition) {
    return Response.json({ error: "Umfrageteil 1 nicht gefunden" }, { status: 404 })
  }

  const surveySessions = await db.surveySession.findMany({
    where: { surveyId: survey.id },
    include: { responses: { where: { surveyPart: 1 } } },
  })

  const csvHeaders = [
    { id: "createdAt", title: "datum" },
    { id: "sessionId", title: "sitzung_id" },
    { id: "questionId", title: "frage_id" },
    { id: "responseId", title: "ergebnis_antwort_id" },
  ]

  type Result = {
    createdAt: string
    sessionId: string
    questionId: string
    responseId?: string | number
  }

  const csvData: Result[] = []

  surveySessions.forEach((surveySession) => {
    const { id, createdAt, responses } = surveySession

    responses.forEach(({ data: responseData }) => {
      const parsed = JSON.parse(responseData) as Record<string, string | number>
      Object.entries(parsed).forEach(([questionId, responseId]) => {
        csvData.push({
          createdAt: createdAt.toLocaleDateString("de-DE"),
          sessionId: String(id),
          questionId,
          responseId,
        })
      })
    })
  })

  return sendCsvResponse(
    csvHeaders,
    csvData,
    `${format(new Date(), "yyyy-MM-dd")}_beteiligung_teil1_ergebnisse_${survey.slug}.csv`,
  )
}
