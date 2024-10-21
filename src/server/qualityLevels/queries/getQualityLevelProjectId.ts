import db from "@/db"

const getQualityLevelProjectId = async (input: Record<string, any>) =>
  (
    await db.qualityLevel.findFirstOrThrow({
      where: { id: input.id || null },
      select: { projectId: true },
    })
  ).projectId

export default getQualityLevelProjectId
