import { queryOptions } from "@tanstack/react-query"
import {
  getProjectRecordTemplateFn,
  getProjectRecordTemplatesByProjectFn,
  getProjectRecordTemplatesFn,
  getTagsAdminFn,
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

export function tagsAdminQueryOptions() {
  return queryOptions({
    queryKey: ["tags", "admin"],
    queryFn: () => getTagsAdminFn({ data: {} }),
  })
}
