import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  CreateFormTemplateSchema,
  DeleteFormTemplateSchema,
  FormTemplateByIdSchema,
  FormFieldValuesSchema,
  FormTemplatesByProjectSchema,
  UpdateFormTemplateSchema,
} from "@/src/shared/formTemplates/schemas"
import { getFormFieldValues } from "./formFieldValues.server"
import { GetFormTemplatesSchema } from "./formTemplates.inputSchemas"
import {
  createFormTemplate,
  deleteFormTemplate,
  getFormTemplate,
  getFormTemplates,
  getFormTemplatesByProject,
  updateFormTemplate,
} from "./formTemplates.server"

export const getFormTemplatesFn = createServerFn({ method: "GET" })
  .validator(GetFormTemplatesSchema)
  .handler(() => getFormTemplates(getRequestHeaders()))

export const getFormTemplatesByProjectFn = createServerFn({ method: "GET" })
  .validator(FormTemplatesByProjectSchema)
  .handler(({ data }) => getFormTemplatesByProject(getRequestHeaders(), data))

export const getFormTemplateFn = createServerFn({ method: "GET" })
  .validator(FormTemplateByIdSchema)
  .handler(({ data }) => getFormTemplate(getRequestHeaders(), data))

export const createFormTemplateFn = createServerFn({ method: "POST" })
  .validator(CreateFormTemplateSchema)
  .handler(({ data }) => createFormTemplate(getRequestHeaders(), data))

export const updateFormTemplateFn = createServerFn({ method: "POST" })
  .validator(UpdateFormTemplateSchema)
  .handler(({ data }) => updateFormTemplate(getRequestHeaders(), data))

export const deleteFormTemplateFn = createServerFn({ method: "POST" })
  .validator(DeleteFormTemplateSchema)
  .handler(({ data }) => deleteFormTemplate(getRequestHeaders(), data))

export const getFormFieldValuesFn = createServerFn({ method: "GET" })
  .validator(FormFieldValuesSchema)
  .handler(({ data }) => getFormFieldValues(getRequestHeaders(), data))
