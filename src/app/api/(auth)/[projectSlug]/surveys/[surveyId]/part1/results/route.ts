import db from "@/db"
import { getSurveyForExport } from "@/src/app/api/(auth)/[projectSlug]/surveys/[surveyId]/_utils/getSurveyForExport"
import { sendCsvResponse } from "@/src/app/api/(auth)/[projectSlug]/surveys/[surveyId]/_utils/sendCsvResponse"
import { withProjectMembership } from "@/src/app/api/(auth)/_utils/withProjectMembership"
import { SurveyFieldRadioOrCheckboxGroupConfig } from "@/src/app/beteiligung/_shared/types"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { viewerRoles } from "@/src/authorization/constants"
import { format } from "date-fns"

// Blitz session + Prisma are Node runtime concerns; avoid Edge runtime
export const runtime = "nodejs"
// Cookie-authenticated, user-specific CSV; avoid accidental caching
export const dynamic = "force-dynamic"

export const GET = withProjectMembership(viewerRoles, async ({ params }) => {
  const { projectSlug, surveyId } = params
  const surveyIdNum = Number(surveyId)

  const survey = await getSurveyForExport(projectSlug, surveyIdNum)

  const questions = {}

  const surveyDefinition = getConfigBySurveySlug(survey.slug, "part1")
  if (!surveyDefinition) {
    return new Response(JSON.stringify({ error: "Umfrageteil 1 nicht gefunden" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }

  surveyDefinition.pages.forEach((page) => {
    page.fields
      .filter((f) => f.componentType === "form")
      .forEach((field) => {
        if (
          ["SurveyCheckboxGroup", "SurveyRadiobuttonGroup", "SurveySelect"].includes(
            field.component,
          )
        ) {
          const fieldProps = field.props as SurveyFieldRadioOrCheckboxGroupConfig["props"]
          // @ts-expect-error
          field.responses = Object.fromEntries(fieldProps.options.map((r) => [r.key, r]))
        }
        // @ts-expect-error
        questions[field.id] = field
      })
  })

  const surveySessions = await db.surveySession.findMany({
    where: { surveyId: survey.id },
    include: { responses: { where: { surveyPart: 1 } } },
  })

  const headers = [
    { id: "createdAt", title: "datum" },
    { id: "sessionId", title: "sitzung_id" },
    { id: "questionId", title: "frage_id" },
    { id: "responseId", title: "ergebnis_antwort_id" },
  ]

  type Result = {
    createdAt: string
    sessionId: string
    questionId: string
    responseId?: string
  }

  const csvData: Result[] = []

  surveySessions.forEach((surveySession) => {
    const { id, createdAt, responses } = surveySession

    responses.forEach(({ data }) => {
      // @ts-expect-error
      data = JSON.parse(data)
      Object.entries(data).map(([questionId, responseData]) => {
        let row: Result = {
          createdAt: createdAt.toLocaleDateString("de-DE"),
          sessionId: String(id),
          questionId: "n/a",
        }
        const responseId = responseData
        row = { ...row, questionId, responseId }
        csvData.push(row)
      })
    })
  })

  return sendCsvResponse(
    headers,
    csvData,
    `${format(new Date(), "yyyy-MM-dd")}_beteiligung_teil1_ergebnisse_${survey.slug}.csv`,
  )
})
