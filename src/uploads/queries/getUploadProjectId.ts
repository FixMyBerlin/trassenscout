import db from "db"

const getUploadProjectId = async (input: Record<string, any>) =>
  (
    await db.upload.findFirstOrThrow({
      where: { id: input.id || null },
      select: { projectId: true },
    })
  ).projectId

export default getUploadProjectId
