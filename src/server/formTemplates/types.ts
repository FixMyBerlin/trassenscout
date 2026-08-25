import type { getFormTemplates, getFormTemplatesByProject } from "./formTemplates.server"

export type FormTemplatesList = Awaited<ReturnType<typeof getFormTemplates>>

type FormTemplatesByProject = Awaited<ReturnType<typeof getFormTemplatesByProject>>
export type FormTemplateOption = FormTemplatesByProject[number]
