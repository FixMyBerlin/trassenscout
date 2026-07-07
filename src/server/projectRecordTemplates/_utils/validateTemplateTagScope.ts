import db from "@/src/server/db.server"

export const validateTemplateTagScope = async ({
  projectIds,
  tagIds,
}: {
  projectIds: number[]
  tagIds: number[]
}) => {
  if (!tagIds.length) return

  const tags = await db.tag.findMany({
    where: { id: { in: tagIds } },
    select: { id: true, projectId: true },
  })

  if (tags.length !== tagIds.length) {
    throw new Error("Mindestens ein ausgewähltes Tag ist ungültig.")
  }

  const invalidTag = tags.find((tag) => !projectIds.includes(tag.projectId))
  if (invalidTag) {
    throw new Error("Ausgewählte Tags müssen zu den ausgewählten Projekten gehören.")
  }
}
