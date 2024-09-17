import db from "@/db"

const getSubsubsectionSpecialProjectId = async (input: Record<string, any>) =>
  (
    await db.subsubsectionSpecial.findFirstOrThrow({
      where: { id: input.id || null },
      select: { projectId: true },
    })
  ).projectId

export default getSubsubsectionSpecialProjectId
