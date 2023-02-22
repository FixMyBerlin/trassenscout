import db from "db"

const getStakeholdernoteProjectId = async (input: Record<string, any>) =>
  (
    await db.section.findFirstOrThrow({
      where: { stakeholdernote: { some: { id: input.id || null } } },
      select: { projectId: true },
    })
  ).projectId

export default getStakeholdernoteProjectId
