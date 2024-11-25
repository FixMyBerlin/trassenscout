import { TSurvey } from "@/src/survey-public/components/types"
import { getSurveyDefinitionBySurveySlug } from "@/src/survey-public/utils/getConfigBySurveySlug"
import { format } from "date-fns"
import { NextApiRequest, NextApiResponse } from "next"
import { getSurvey, sendCsv } from "./_shared"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const survey = await getSurvey(req, res)
  if (!survey) return

  const surveyDefinition = getSurveyDefinitionBySurveySlug(survey.slug)

  const headers = [
    { id: "id", title: "frage_id" },
    { id: "type", title: "typ" },
    { id: "question", title: "frage" },
  ]

  const types = {
    singleResponse: "einfach",
    multipleResponse: "mehrfach",
  }

  type Question = { id: number | string; type: string; question: string }
  let data: Question[] = []
  const addQuestions = (definition: TSurvey) => {
    definition.pages.forEach((page) => {
      if (!page.questions) return
      page.questions.forEach(({ id, component, label }) => {
        // @ts-expect-error
        data.push({ id, type: types[component] || component, question: label.de })
      })
    })
  }

  addQuestions(surveyDefinition)

  sendCsv(
    res,
    headers,
    data,
    `${format(new Date(), "yyyy/MM/dd")}_umfrage_fragen_${survey.slug}.csv`,
  )
}
