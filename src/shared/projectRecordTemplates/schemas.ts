import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"

const CheckboxNumberArraySchema = z
  .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
  .transform((value) => {
    if (!Array.isArray(value)) return []
    return Array.from(new Set(value))
  })

export const ProjectRecordTemplateFormSchema = z.object({
  templateTitle: z.string().min(2, { error: "Pflichtfeld. Mindestens 2 Zeichen." }),
  entryTitle: z.string().min(2, { error: "Pflichtfeld. Mindestens 2 Zeichen." }),
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

export const UpdateProjectRecordTemplateSchema = ProjectRecordTemplateByIdSchema.extend(
  ProjectRecordTemplateFormSchema.shape,
)

export const DeleteProjectRecordTemplateSchema = ProjectRecordTemplateByIdSchema

export type ProjectRecordTemplateFormValues = z.infer<typeof ProjectRecordTemplateFormSchema>

/** TanStack Form field values — checkbox groups store string ids until Zod coerces on submit. */
export type ProjectRecordTemplateFormFieldValues = Omit<
  ProjectRecordTemplateFormValues,
  "projectIds" | "projectRecordTopicIds"
> & {
  projectIds: string[]
  projectRecordTopicIds: string[]
}

export const projectRecordTemplateFormDefaultValues: ProjectRecordTemplateFormFieldValues = {
  templateTitle: "",
  entryTitle: "",
  body: "",
  purpose: "",
  projectIds: [],
  projectRecordTopicIds: [],
}
