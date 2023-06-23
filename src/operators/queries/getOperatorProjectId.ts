import db from "db"

const getOperatorProjectId = async (input: Record<string, any>) =>
  (
    await db.operator.findFirstOrThrow({
      where: { id: input.id || null },
      select: { projectId: true },
    })
  ).projectId

export default getOperatorProjectId
