import db from "@/db"

const getProjectIdBySurveyResponse = async (input: Record<string, any>) => {
  const responseId = input.id || null

  const surveySession = await db.survey.findFirstOrThrow({
    where: { SurveySession: { some: { responses: { some: { id: responseId } } } } },
    select: { projectId: true },
  })

  return surveySession.projectId
}

export default getProjectIdBySurveyResponse
