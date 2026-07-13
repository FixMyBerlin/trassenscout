import { queryOptions } from "@tanstack/react-query"
import type { EmailTemplateKey } from "@/src/shared/emailTemplates/registry"
import { getEmailTemplateFn, getEmailTemplatesFn } from "./emailTemplates.functions"

export function emailTemplatesQueryOptions() {
  return queryOptions({
    queryKey: ["emailTemplates"],
    queryFn: () => getEmailTemplatesFn({ data: {} }),
  })
}

export function emailTemplateQueryOptions(key: EmailTemplateKey) {
  return queryOptions({
    queryKey: ["emailTemplate", key],
    queryFn: () => getEmailTemplateFn({ data: { key } }),
  })
}
