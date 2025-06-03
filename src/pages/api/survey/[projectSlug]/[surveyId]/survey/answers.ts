import { SurveyFieldRadioOrCheckboxGroupConfig } from "@/src/app/beteiligung-neu/_shared/types"
import { getConfigBySurveySlug } from "@/src/app/beteiligung-neu/_shared/utils/getConfigBySurveySlug"
import { format } from "date-fns"
import { NextApiRequest, NextApiResponse } from "next"
import { getSurvey, sendCsv } from "./_shared"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Permissions are checked implicitly by `getSurvey` which will call "@/src/surveys/queries/getSurvey" which uses `authorizeProjectMember`
  const survey = await getSurvey(req, res)
  if (!survey) return

  const surveyDefinition = getConfigBySurveySlug(survey.slug, "part1")
  if (!surveyDefinition) return res.status(404).json({ error: "Umfrageteil 1 nicht gefunden" })

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

  sendCsv(
    res,
    headers,
    data,
    `${format(new Date(), "yyyy-MM-dd")}_umfrage_antworten_${survey.slug}.csv`,
  )
}
