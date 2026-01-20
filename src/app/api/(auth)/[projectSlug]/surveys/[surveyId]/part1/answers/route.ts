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

  const surveyDefinition = getConfigBySurveySlug(survey.slug, "part1")
  if (!surveyDefinition) {
    return new Response(JSON.stringify({ error: "Umfrageteil 1 nicht gefunden" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }

  const headers = [
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
    headers,
    data,
    `${format(new Date(), "yyyy-MM-dd")}_beteiligung_teil1_antworten_${survey.slug}.csv`,
  )
})
