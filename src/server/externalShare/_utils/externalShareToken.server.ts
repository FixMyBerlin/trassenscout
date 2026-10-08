import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { generateSecureToken } from "@/src/server/utils/generateSecureToken.server"

export const createExternalShareToken = () => generateSecureToken()

/** Admin switch; the first enable mints the link, disabling keeps it so partners' links come back. */
export async function setExternalShareEnabled(input: {
  projectSlugs: string[]
  enabled: boolean
  userId: number
}) {
  const projects = await db.project.findMany({
    where: { slug: { in: input.projectSlugs }, externalShareEnabled: !input.enabled },
    select: { id: true, externalShareToken: true },
  })

  for (const project of projects) {
    const mintToken = input.enabled && !project.externalShareToken
    await db.project.update({
      where: { id: project.id },
      data: {
        externalShareEnabled: input.enabled,
        ...(mintToken ? { externalShareToken: createExternalShareToken() } : {}),
      },
    })
    await createLogEntry({
      action: "UPDATE",
      message: input.enabled
        ? "Externe Freigabe wurde aktiviert."
        : "Externe Freigabe wurde deaktiviert.",
      userId: input.userId,
      projectId: project.id,
      previousRecord: { externalShareEnabled: !input.enabled },
      updatedRecord: { externalShareEnabled: input.enabled },
    })
  }

  return { count: projects.length }
}
