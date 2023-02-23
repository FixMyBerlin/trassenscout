import db from "db"

const getContactProjectId = async (input: Record<string, any>) =>
  (
    await db.contact.findFirstOrThrow({
      where: { id: input.id || null },
      select: { projectId: true },
    })
  ).projectId

export default getContactProjectId
