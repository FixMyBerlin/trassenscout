import db from "db"

const getFileProjectId = async (input: Record<string, any>) =>
  (
    await db.file.findFirstOrThrow({
      where: { id: input.id || null },
      select: { projectId: true },
    })
  ).projectId

export default getFileProjectId
