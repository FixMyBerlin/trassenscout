import db from "@/src/server/db.server"

export async function checkProjectAiEnabled(projectId: number) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { aiEnabled: true },
  })

  return project?.aiEnabled ?? false
}

export async function assertProjectAiEnabled(projectId: number) {
  const enabled = await checkProjectAiEnabled(projectId)
  if (!enabled) {
    throw new Error("AI features are disabled for this project")
  }
}
