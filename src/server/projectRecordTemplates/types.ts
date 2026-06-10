import type {
  getProjectRecordTemplates,
  getProjectRecordTemplatesByProject,
} from "./projectRecordTemplates.server"

export type ProjectRecordTemplatesList = Awaited<ReturnType<typeof getProjectRecordTemplates>>
type ProjectRecordTemplatesByProject = Awaited<
  ReturnType<typeof getProjectRecordTemplatesByProject>
>
export type ProjectRecordTemplateOption = ProjectRecordTemplatesByProject[number]
