import { NextApiRequest, NextApiResponse } from "next"
import surveyDefinition from "src/participation/data/survey.json"
import feedbackDefinition from "src/participation/data/feedback.json"
import { Survey } from "src/participation/data/types"
import { authenticate, sendCsv } from "./_shared"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await authenticate(req, res))) return

  const headers = [
    { id: "id", title: "id" },
    { id: "type", title: "type" },
    { id: "question", title: "text" },
  ]

  const types = {
    singleResponse: 'single',
    multipleResponse: 'multi'
  }

  type Question = { id: number | string; type: string; question: string }
  let data: Question[] = [{ id: "id", type: "type", question: "text" }]
  const addQuestions = (definition: Survey) => {
    definition.pages.forEach((page) => {
      if (!page.questions) return
      page.questions.forEach(({id, component, label}) => {
        // @ts-ignore
        data.push({ id, type: types[component] || component, question: label.de })
      })
    })
  }
  // @ts-ignore
  addQuestions(surveyDefinition)
  // @ts-ignore
  addQuestions(feedbackDefinition)
  data = data.filter(({ id }) => ![22, 31, 32, 33].includes(Number(id)))

  sendCsv(res, headers, data)
}
