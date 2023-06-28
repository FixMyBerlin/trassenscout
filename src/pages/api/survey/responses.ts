import { NextApiRequest, NextApiResponse } from "next"
import surveyDefinition from "src/participation/data/survey.json"
import feedbackDefinition from "src/participation/data/feedback.json"
import { Survey } from "src/participation/data/types"
import { authenticate, sendCsv } from "./_shared"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await authenticate(req, res))) return

  const headers = [
    { id: "questionId", title: "questionId" },
    { id: "responseId", title: "responseId" },
    { id: "text", title: "text" },
  ]

  type Question = { questionId: number | string; responseId: number | string; text: string }
  let data: Question[] = [{ questionId: "questionId", responseId: "responseId", text: "text" }]
  const addQuestions = (definition: Survey) => {
    definition.pages.forEach((page) => {
      if (!page.questions) return
      page.questions.forEach((question) => {
        if (!["singleResponse", "multiResponse"].includes(question.component)) return
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
  // @ts-ignore
  addQuestions(feedbackDefinition)
  data = data.filter(({ questionId }) => questionId !== 22)

  sendCsv(res, headers, data)
}
