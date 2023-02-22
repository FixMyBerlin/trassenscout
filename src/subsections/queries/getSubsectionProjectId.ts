import db from "db"

const getSubsectionProjectId = async (input: Record<string, any>) =>
  (
    await db.section.findFirstOrThrow({
      where: { subsections: { some: { id: input.id || null } } },
      select: { projectId: true },
    })
  ).projectId

export default getSubsectionProjectId
