import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import type { FormFieldValuesSchema } from "@/src/shared/formTemplates/schemas"
import {
  getFormFieldValuesFn,
  getFormTemplateFn,
  getFormTemplatesByProjectFn,
  getFormTemplatesFn,
} from "./formTemplates.functions"
import type { FormTemplatesByProjectInput } from "./formTemplates.server"

export function formTemplatesQueryOptions() {
  return queryOptions({
    queryKey: ["formTemplates"],
    queryFn: () => getFormTemplatesFn({ data: {} }),
  })
}

export function formTemplatesByProjectQueryOptions(input: FormTemplatesByProjectInput) {
  return queryOptions({
    queryKey: ["formTemplates", input],
    queryFn: () => getFormTemplatesByProjectFn({ data: input }),
  })
}

export function formTemplateQueryOptions(id: number) {
  return queryOptions({
    queryKey: ["formTemplate", id],
    queryFn: () => getFormTemplateFn({ data: { id } }),
  })
}

export function formFieldValuesQueryOptions(input: z.infer<typeof FormFieldValuesSchema>) {
  return queryOptions({
    queryKey: ["formFieldValues", input],
    queryFn: () => getFormFieldValuesFn({ data: input }),
  })
}
