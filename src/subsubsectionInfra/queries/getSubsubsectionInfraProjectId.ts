import db from "@/db"

const getSubsubsectionInfraProjectId = async (input: Record<string, any>) =>
  (
    await db.subsubsectionInfra.findFirstOrThrow({
      where: { id: input.id || null },
      select: { projectId: true },
    })
  ).projectId

export default getSubsubsectionInfraProjectId
