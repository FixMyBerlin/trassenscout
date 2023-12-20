import db from "db"

const getSubsubsectionTaskProjectId = async (input: Record<string, any>) =>
  (
    await db.subsubsectionTask.findFirstOrThrow({
      where: { id: input.id || null },
      select: { projectId: true },
    })
  ).projectId

export default getSubsubsectionTaskProjectId
