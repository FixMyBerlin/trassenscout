import { NextApiRequest, NextApiResponse } from "next"
import { authenticate, sendCsv } from "./_shared"
import db from "db"
import surveyDefinition from "src/participation/data/survey.json"
import feedbackDefinition from "src/participation/data/feedback.json"

const surveys = Object.fromEntries([surveyDefinition, feedbackDefinition].map((o) => [o.id, o]))
const questions = {}
Object.values(surveys).forEach((survey) => {
  survey.pages.forEach((page) => {
    if (!page.questions) return
    page.questions.forEach((question) => {
      // @ts-ignore
      if (["singleResponse", "multipleResponse"].includes(question.component)) {
        // @ts-ignore
        question.responses = Object.fromEntries(question.props.responses.map((r) => [r.id, r]))
      }
      // @ts-ignore
      questions[question.id] = question
    })
  })
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await authenticate(req, res))) return

  const surveySessions = await db.surveySession.findMany({ include: { responses: true } })
  console.log("surveySessions", surveySessions)

  const headers = [
    { id: "createdAt", title: "createdAt" },
    { id: "sessionId", title: "sessionId" },
    { id: "questionId", title: "questionId" },
    { id: "responseId", title: "responseId" },
    { id: "responseIds", title: "responseIds" },
    { id: "responseText", title: "responseText" },
    { id: "responseData", title: "responseData" },
  ]

  type Result = {
    createdAt: string
    sessionId: string
    questionId: string
    responseId?: string
    responseIds?: string
    responseText?: string
    responseData?: string
  }

  const csvData: Result[] = []

  surveySessions.forEach((surveySession) => {
    const { id, createdAt, responses } = surveySession
    console.log(id, createdAt.toISOString(), responses)
    responses.forEach(({ data }) => {
      // @ts-ignore
      data = JSON.parse(data)
      Object.entries(data).map(([questionId, responseData]) => {
        // @ts-ignore
        const question = questions[questionId]
        let row: Result = {
          createdAt: createdAt.toISOString(),
          sessionId: String(id),
          questionId: "n/a",
        }
        if (question.component === "singleResponse") {
          const responseId = responseData
          row = { ...row, questionId, responseId }
        } else if (question.component === "multipleResponse") {
          const responseIds = responseData
          row = { ...row, questionId, responseIds }
        } else if (question.component === "text") {
          const responseText = responseData
          row = { ...row, questionId, responseText }
        } else {
          row = { ...row, questionId, responseData: JSON.stringify(responseData) }
        }
        csvData.push(row)
      })
    })
  })
  //
  sendCsv(res, headers, csvData, "results.csv")
}
