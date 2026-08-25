import type { FormTemplateTypeEnum } from "@/src/prisma/generated/browser"

export type FormTemplateRef = {
  id: number
  title: string
  slug: string
  type: FormTemplateTypeEnum
  projects: { slug: string }[]
}

export type FormTemplateRecordSource = {
  formTemplates: FormTemplateRef[]
  /** Read live, so template changes reach existing records. */
  projectRecordTemplate?: { formTemplates: FormTemplateRef[] } | null
}

export type FormTemplateRecordContext = {
  projectSlug: string
  hasSubsubsection: boolean
  hasAcquisitionArea: boolean
}

/**
 * Inherited plus directly attached, reduced to the relation the record has and to this
 * project: a shared protocol template can carry a form only some of its projects have.
 */
export function getEffectiveFormTemplates(
  record: FormTemplateRecordSource,
  context: FormTemplateRecordContext,
): FormTemplateRef[] {
  const allowedTypes = new Set<FormTemplateTypeEnum>()
  if (context.hasSubsubsection) allowedTypes.add("SUBSUBSECTION")
  if (context.hasAcquisitionArea) allowedTypes.add("ACQUISITIONAREA")
  if (allowedTypes.size === 0) return []

  const byId = new Map<number, FormTemplateRef>()
  for (const formTemplate of [
    ...(record.projectRecordTemplate?.formTemplates ?? []),
    ...record.formTemplates,
  ]) {
    if (!allowedTypes.has(formTemplate.type)) continue
    if (!formTemplate.projects.some((project) => project.slug === context.projectSlug)) continue
    byId.set(formTemplate.id, formTemplate)
  }

  return Array.from(byId.values()).sort((a, b) => a.title.localeCompare(b.title, "de"))
}
