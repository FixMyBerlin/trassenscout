import db from "@/db"

const getSurveyProjectId = async (input: Record<string, any>) =>
  (
    await db.survey.findFirstOrThrow({
      where: { id: input.id || null },
      select: { projectId: true },
    })
  ).projectId

export default getSurveyProjectId
