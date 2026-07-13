import { z } from "zod"
import { InputNumberOrNullSchema } from "@/src/components/core/utils/schema-shared"

export const ProjectRecordEmailSchema = z.object({
  text: z.string().min(1, { error: "E-Mail-Inhalt ist ein Pflichtfeld." }),
  projectId: InputNumberOrNullSchema,
  date: z.date().nullish(),
  from: z.string().nullish(),
  subject: z.string().nullish(),
  textBody: z.string().nullish(),
})

export const UpdateProjectRecordEmailSchema = ProjectRecordEmailSchema.extend({
  id: z.number(),
})

export const DeleteProjectRecordEmailSchema = z.object({
  id: z.number(),
})

export const ProjectRecordEmailFormSchema = z.object({
  text: z.string().min(1, { error: "E-Mail-Inhalt ist ein Pflichtfeld." }),
  projectId: InputNumberOrNullSchema,
})

export const projectRecordEmailFormDefaultValues: z.infer<typeof ProjectRecordEmailFormSchema> = {
  text: "",
  projectId: null,
}
