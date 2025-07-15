import db from "@/db"
import { SurveyFieldRadioOrCheckboxGroupConfig } from "@/src/app/beteiligung/_shared/types"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { format } from "date-fns"
import { NextApiRequest, NextApiResponse } from "next"
import { getSurvey, sendCsv } from "./_shared"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Permissions are checked implicitly by `getSurvey` which will call "@/src/surveys/queries/getSurvey" which uses `authorizeProjectMember`
  const survey = await getSurvey(req, res)
  if (!survey) return

  const questions = {}

  const surveyDefinition = getConfigBySurveySlug(survey.slug, "part1")
  if (!surveyDefinition) return res.status(404).json({ error: "Umfrageteil 1 nicht gefunden" })
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

  sendCsv(
    res,
    headers,
    csvData,
    `${format(new Date(), "yyyy-MM-dd")}_umfrage_fragen_${survey.slug}.csv`,
  )
}
