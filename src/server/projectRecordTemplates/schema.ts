import { ProjectSlugRequiredSchema } from "@/src/authorization/extractProjectSlug"
import { z } from "zod"

const CheckboxNumberArraySchema = z
  .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
  .transform((value) => {
    if (!Array.isArray(value)) return []
    return Array.from(new Set(value))
  })

export const ProjectRecordTemplateFormSchema = z.object({
  templateTitle: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  entryTitle: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  body: z.string().optional().nullable(),
  purpose: z.string().optional().nullable(),
  projectIds: CheckboxNumberArraySchema,
  projectRecordTopicIds: CheckboxNumberArraySchema,
})

export const ProjectRecordTemplateByIdSchema = z.object({
  id: z.number(),
})

export const ProjectRecordTemplatesByProjectSchema = ProjectSlugRequiredSchema

export const CreateProjectRecordTemplateSchema = ProjectRecordTemplateFormSchema

export const UpdateProjectRecordTemplateSchema = ProjectRecordTemplateByIdSchema.merge(
  ProjectRecordTemplateFormSchema,
)

export const DeleteProjectRecordTemplateSchema = ProjectRecordTemplateByIdSchema

export type ProjectRecordTemplateFormValues = z.infer<typeof ProjectRecordTemplateFormSchema>
