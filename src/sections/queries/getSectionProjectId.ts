import db from "db"

const getSectionProjectId = async (input: Record<string, any>) =>
  (
    await db.section.findFirstOrThrow({
      where: { id: input.id },
      select: { projectId: true },
    })
  ).projectId

export default getSectionProjectId
