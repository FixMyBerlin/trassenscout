import db from "db"

const getNetworkHierarchyProjectId = async (input: Record<string, any>) =>
  (
    await db.networkHierarchy.findFirstOrThrow({
      where: { id: input.id || null },
      select: { projectId: true },
    })
  ).projectId

export default getNetworkHierarchyProjectId
