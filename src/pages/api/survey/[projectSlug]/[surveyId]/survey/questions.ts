import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { format } from "date-fns"
import { NextApiRequest, NextApiResponse } from "next"
import { getSurvey, sendCsv } from "./_shared"

const translatedComponentTypesLegacy = {
  singleResponse: "einfach",
  multipleResponse: "mehrfach",
  text: "text",
  textfield: "text",
  readOnly: "text readonly",
}

const translatedComponentTypes = {
  SurveyCheckboxGroup: "mehrfach",
  SurveyRadiobuttonGroup: "einfach",
  SurveySelect: "einfach",
  SurveyTextfield: "text",
  SurveyTextarea: "text",
  SurveySimpleMapWithLegend: "geo",
  SurveyCheckbox: "bool",
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Permissions are checked implicitly by `getSurvey` which will call "@/src/surveys/queries/getSurvey" which uses `authorizeProjectMember`
  const survey = await getSurvey(req, res)
  if (!survey) return

  const surveyDefinition = getConfigBySurveySlug(survey.slug, "part1")
  if (!surveyDefinition) return res.status(404).json({ error: "Umfrageteil 1 nicht gefunden" })

  const headers = [
    { id: "id", title: "frage_id" },
    { id: "type", title: "typ" },
    { id: "question", title: "frage" },
  ]

  type Question = { id: number | string; type: string; question: string }
  let data: Question[] = []

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

  sendCsv(
    res,
    headers,
    data,
    `${format(new Date(), "yyyy-MM-dd")}_umfrage_fragen_${survey.slug}.csv`,
  )
}
