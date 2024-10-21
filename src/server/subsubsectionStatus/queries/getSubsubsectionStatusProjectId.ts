import db from "@/db"

const getSubsubsectionStatusProjectId = async (input: Record<string, any>) =>
  (
    await db.subsubsectionStatus.findFirstOrThrow({
      where: { id: input.id || null },
      select: { projectId: true },
    })
  ).projectId

export default getSubsubsectionStatusProjectId
