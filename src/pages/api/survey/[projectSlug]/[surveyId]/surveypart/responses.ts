import { TSurvey } from "@/src/survey-public/components/types"
import { getSurveyDefinitionBySurveySlug } from "@/src/survey-public/utils/getConfigBySurveySlug"
import { NextApiRequest, NextApiResponse } from "next"
import { getSurvey, sendCsv } from "./_shared"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
        // @ts-ignore
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

  // @ts-ignore
  addQuestions(surveyDefinition)

  // for now we only want questions, not feedback part
  // in case we want to include the feedack part we cvan uncomment that line
  // @ts-ignore
  // addQuestions(feedbackDefinition)

  sendCsv(res, headers, data, "antworten.csv")
}
