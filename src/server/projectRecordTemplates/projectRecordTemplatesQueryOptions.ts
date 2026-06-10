import { queryOptions } from "@tanstack/react-query"
import {
  getProjectRecordTemplateFn,
  getProjectRecordTemplatesByProjectFn,
  getProjectRecordTemplatesFn,
  getProjectRecordTopicsAdminFn,
} from "./projectRecordTemplates.functions"
import type { ProjectRecordTemplatesByProjectInput } from "./projectRecordTemplates.server"

export function projectRecordTemplatesQueryOptions() {
  return queryOptions({
    queryKey: ["projectRecordTemplates"],
    queryFn: () => getProjectRecordTemplatesFn({ data: {} }),
  })
}

export function projectRecordTemplatesByProjectQueryOptions(
  input: ProjectRecordTemplatesByProjectInput,
) {
  return queryOptions({
    queryKey: ["projectRecordTemplates", input],
    queryFn: () => getProjectRecordTemplatesByProjectFn({ data: input }),
  })
}

export function projectRecordTemplateQueryOptions(id: number) {
  return queryOptions({
    queryKey: ["projectRecordTemplate", id],
    queryFn: () => getProjectRecordTemplateFn({ data: { id } }),
  })
}

export function projectRecordTopicsAdminQueryOptions() {
  return queryOptions({
    queryKey: ["projectRecordTopics", "admin"],
    queryFn: () => getProjectRecordTopicsAdminFn({ data: {} }),
  })
}
