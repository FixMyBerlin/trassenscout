import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  EmailTemplateByKeySchema,
  UpsertEmailTemplateSchema,
} from "@/src/shared/emailTemplates/schemas"
import { DeleteEmailTemplateSchema, GetEmailTemplatesSchema } from "./emailTemplates.inputSchemas"
import {
  deleteEmailTemplate,
  getEmailTemplate,
  getEmailTemplates,
  previewEmailTemplate,
  upsertEmailTemplate,
} from "./emailTemplates.server"
export const getEmailTemplatesFn = createServerFn({ method: "GET" })
  .validator(GetEmailTemplatesSchema)
  .handler(() => getEmailTemplates(getRequestHeaders()))

export const getEmailTemplateFn = createServerFn({ method: "GET" })
  .validator(EmailTemplateByKeySchema)
  .handler(({ data }) => getEmailTemplate(getRequestHeaders(), data))

export const upsertEmailTemplateFn = createServerFn({ method: "POST" })
  .validator(UpsertEmailTemplateSchema)
  .handler(({ data }) => upsertEmailTemplate(getRequestHeaders(), data))

export const deleteEmailTemplateFn = createServerFn({ method: "POST" })
  .validator(DeleteEmailTemplateSchema)
  .handler(({ data }) => deleteEmailTemplate(getRequestHeaders(), data))

export const previewEmailTemplateFn = createServerFn({ method: "POST" })
  .validator(UpsertEmailTemplateSchema)
  .handler(({ data }) => previewEmailTemplate(getRequestHeaders(), data))
