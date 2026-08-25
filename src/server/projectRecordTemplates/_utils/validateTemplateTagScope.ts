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

/** A form must be available in at least one of the template's projects. */
export const validateTemplateFormTemplateScope = async ({
  projectIds,
  formTemplateIds,
}: {
  projectIds: number[]
  formTemplateIds: number[]
}) => {
  if (!formTemplateIds.length) return

  const formTemplates = await db.formTemplate.findMany({
    where: { id: { in: formTemplateIds } },
    select: { id: true, projects: { select: { id: true } } },
  })

  if (formTemplates.length !== formTemplateIds.length) {
    throw new Error("Mindestens ein ausgewähltes Formular ist ungültig.")
  }

  const invalid = formTemplates.find(
    (formTemplate) => !formTemplate.projects.some((project) => projectIds.includes(project.id)),
  )
  if (invalid) {
    throw new Error("Ausgewählte Formulare müssen zu den ausgewählten Projekten gehören.")
  }
}
