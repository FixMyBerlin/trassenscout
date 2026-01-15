import { getSurveyForExport } from "@/src/app/api/(auth)/[projectSlug]/surveys/[surveyId]/_utils/getSurveyForExport"
import { sendCsvResponse } from "@/src/app/api/(auth)/[projectSlug]/surveys/[surveyId]/_utils/sendCsvResponse"
import { withProjectMembership } from "@/src/app/api/(auth)/_utils/withProjectMembership"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { viewerRoles } from "@/src/authorization/constants"
import { format } from "date-fns"

// Blitz session + Prisma are Node runtime concerns; avoid Edge runtime
export const runtime = "nodejs"
// Cookie-authenticated, user-specific CSV; avoid accidental caching
export const dynamic = "force-dynamic"

const translatedComponentTypes = {
  SurveyCheckboxGroup: "mehrfach",
  SurveyRadiobuttonGroup: "einfach",
  SurveySelect: "einfach",
  SurveyTextfield: "text",
  SurveyTextarea: "text",
  SurveySimpleMapWithLegend: "geo",
  SurveyGeoCategoryMapWithLegend: "geo",
  SurveyReadonlyTextfield: "text readonly",
  SurveyCheckbox: "bool",
  hidden: "hidden",
}

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
        data.push({
          id: name,
          type: translatedComponentTypes[component],
          question: props.label || "",
        })
      })
  })

  return sendCsvResponse(
    headers,
    data,
    `${format(new Date(), "yyyy-MM-dd")}_beteiligung_teil1_fragen_${survey.slug}.csv`,
  )
})
