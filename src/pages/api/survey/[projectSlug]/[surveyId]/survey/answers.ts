import { TSurvey } from "@/src/survey-public/components/types"
import { getSurveyDefinitionBySurveySlug } from "@/src/survey-public/utils/getConfigBySurveySlug"
import { format } from "date-fns"
import { NextApiRequest, NextApiResponse } from "next"
import { getSurvey, sendCsv } from "./_shared"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Permissions are checked implicitly by `getSurvey` which will call "@/src/surveys/queries/getSurvey" which uses `authorizeProjectMember`
  const survey = await getSurvey(req, res)
  if (!survey) return
  const surveyDefinition = getSurveyDefinitionBySurveySlug(survey.slug)

  const headers = [
    { id: "questionId", title: "frage_id" },
    { id: "responseId", title: "antwort_id" },
    { id: "text", title: "antwort" },
  ]

  type Question = { questionId: number | string; responseId: number | string; text: string }
  let data: Question[] = []
  const addQuestions = (definition: TSurvey) => {
    definition.pages.forEach((page) => {
      if (!page.questions) return
      page.questions.forEach((question) => {
        if (!["singleResponse", "multipleResponse"].includes(question.component)) return
        // @ts-expect-error
        question.props.responses.forEach((response) => {
          data.push({
            questionId: question.id,
            responseId: response.id,
            text: response.text.de,
          })
        })
      })
    })
  }

  addQuestions(surveyDefinition)

  sendCsv(
    res,
    headers,
    data,
    `${format(new Date(), "yyyy-MM-dd")}_umfrage_antworten_${survey.slug}.csv`,
  )
}
