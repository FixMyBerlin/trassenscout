import db from "@/db"

/**
 * Checks if AI features are enabled for a project
 */
export const checkProjectAiEnabled = async (projectId: number) => {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { aiEnabled: true },
  })

  return project?.aiEnabled || false
}
