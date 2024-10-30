import db from "@/db"
import {
  getFeedbackDefinitionBySurveySlug,
  getSurveyDefinitionBySurveySlug,
} from "@/src/survey-public/utils/getConfigBySurveySlug"
import { format } from "date-fns"
import { NextApiRequest, NextApiResponse } from "next"
import { getSurvey, sendCsv } from "./_shared"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const survey = await getSurvey(req, res)
  if (!survey) return

  const surveyDefinition = getSurveyDefinitionBySurveySlug(survey.slug)
  const feedbackDefinition = getFeedbackDefinitionBySurveySlug(survey.slug)
  const surveys = Object.fromEntries([surveyDefinition, feedbackDefinition].map((o) => [o.part, o]))
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

  const surveySessions = await db.surveySession.findMany({
    where: { surveyId: survey.id },
    include: { responses: { where: { surveyPart: 1 } } },
  })

  // for now we only want questions, not feedback part
  // in case we want to include the feedack part we cvan uncomment these lines

  const headers = [
    { id: "createdAt", title: "datum" },
    { id: "sessionId", title: "sitzung_id" },
    { id: "questionId", title: "frage_id" },
    { id: "responseId", title: "ergebnis_antwort_id" },
    // { id: "responseText", title: "responseText" },
    // { id: "responseData", title: "responseData" },
  ]

  type Result = {
    createdAt: string
    sessionId: string
    questionId: string
    responseId?: string
    // responseText?: string
    // responseData?: string
  }

  const csvData: Result[] = []

  // as we only want to include the latest questions in the export we need to check if the question is in the array of latest questions; in the frm7 project we deleted questions after the survey was live
  const deletedQuestionIds = surveyDefinition.deletedQuestions?.map((q) => q.id)

  surveySessions.forEach((surveySession) => {
    const { id, createdAt, responses } = surveySession

    responses.forEach(({ data }) => {
      // @ts-expect-error
      data = JSON.parse(data)
      Object.entries(data).map(([questionId, responseData]) => {
        if (!deletedQuestionIds || !deletedQuestionIds?.includes(Number(questionId))) {
          let row: Result = {
            createdAt: createdAt.toLocaleDateString("de-DE"),
            sessionId: String(id),
            questionId: "n/a",
          }
          const responseId = responseData
          row = { ...row, questionId, responseId }
          csvData.push(row)
        }
      })
    })
  })

  sendCsv(res, headers, csvData, `${format(new Date(), "yyyy/MM/dd")}_fragen_${survey.slug}.csv`)
}
