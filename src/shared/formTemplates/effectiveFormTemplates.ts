import type { FormTemplateTypeEnum } from "@/src/prisma/generated/browser"

export type FormTemplateRef = {
  id: number
  title: string
  slug: string
  type: FormTemplateTypeEnum
  projects: { slug: string }[]
}

export type FormTemplateRecordSource = {
  /**
   * The record's own, complete set. A Protokollvorlage seeds it once at create; afterwards the
   * record owns it, so an admin can drop a form here without touching the Template.
   */
  formTemplates: FormTemplateRef[]
}

export type FormTemplateRecordContext = {
  projectSlug: string
  hasSubsubsection: boolean
  hasAcquisitionArea: boolean
}

/**
 * The record's forms, reduced to the relation it actually has and to this project: a form can
 * be shared across projects, and a record only offers the ones its own project can open.
 */
export function getEffectiveFormTemplates(
  record: FormTemplateRecordSource,
  context: FormTemplateRecordContext,
): FormTemplateRef[] {
  const allowedTypes = new Set<FormTemplateTypeEnum>()
  if (context.hasSubsubsection) allowedTypes.add("SUBSUBSECTION")
  if (context.hasAcquisitionArea) allowedTypes.add("ACQUISITIONAREA")
  if (allowedTypes.size === 0) return []

  return record.formTemplates
    .filter((formTemplate) => allowedTypes.has(formTemplate.type))
    .filter((formTemplate) =>
      formTemplate.projects.some((project) => project.slug === context.projectSlug),
    )
    .sort((a, b) => a.title.localeCompare(b.title, "de"))
}
