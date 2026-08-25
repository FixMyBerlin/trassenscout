import { z } from "zod"
import { SlugSchema } from "@/src/components/core/utils/schema-shared"
import { FormTemplateTypeEnum } from "@/src/prisma/generated/browser"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { FormTemplateFieldDefinitionsSchema } from "./fieldSchemas"
import { formFieldSourcesForType } from "./sourceRegistry"

const CheckboxNumberArraySchema = z
  .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
  .transform((value) => {
    if (!Array.isArray(value)) return []
    return Array.from(new Set(value))
  })

export const formTemplateTypeLabels: Record<FormTemplateTypeEnum, string> = {
  SUBSUBSECTION: "Maßnahme",
  ACQUISITIONAREA: "Verhandlungsfläche",
}

const FormTemplateFormShape = z.object({
  title: z.string().min(2, { error: "Pflichtfeld. Mindestens 2 Zeichen." }),
  slug: SlugSchema,
  type: z.enum(FormTemplateTypeEnum),
  bodyMarkdown: z.string().min(1, { error: "Pflichtfeld." }),
  fields: FormTemplateFieldDefinitionsSchema,
  projectIds: CheckboxNumberArraySchema,
})

export const FormFieldValuesSchema = ProjectSlugRequiredSchema.extend({
  projectRecordId: z.number(),
  formTemplateId: z.number(),
})

/** Switching the type can leave a field pointing at a source that can never resolve. */
export const FormTemplateFormSchema = FormTemplateFormShape.superRefine((input, ctx) => {
  const allowed = new Set(formFieldSourcesForType(input.type).map((source) => source.key))

  input.fields.forEach((field, index) => {
    if (!field.source || allowed.has(field.source)) return
    ctx.addIssue({
      code: "custom",
      message: `Die Vorbelegung von „${field.name}" passt nicht zu „${formTemplateTypeLabels[input.type]}".`,
      path: ["fields", index, "source"],
    })
  })
})

export const FormTemplateByIdSchema = z.object({
  id: z.number(),
})

export const FormTemplatesByProjectSchema = ProjectSlugRequiredSchema

export const CreateFormTemplateSchema = FormTemplateFormSchema

export const UpdateFormTemplateSchema = FormTemplateByIdSchema.extend(FormTemplateFormShape.shape)

export const DeleteFormTemplateSchema = FormTemplateByIdSchema

export type FormTemplateFormValues = z.infer<typeof FormTemplateFormSchema>

/** The checkbox group stores string ids until Zod coerces on submit. */
export type FormTemplateFormFieldValues = Omit<FormTemplateFormValues, "projectIds"> & {
  projectIds: string[]
}

export const formTemplateFormDefaultValues: FormTemplateFormFieldValues = {
  title: "",
  slug: "",
  type: "SUBSUBSECTION",
  bodyMarkdown: "",
  fields: [],
  projectIds: [],
}
