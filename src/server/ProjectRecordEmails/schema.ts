import { InputNumberOrNullSchema } from "@/src/core/utils/schema-shared"
import { z } from "zod"

export const ProjectRecordEmailSchema = z.object({
  text: z.string().min(1, { message: "E-Mail-Inhalt ist ein Pflichtfeld." }),
  projectId: InputNumberOrNullSchema,
  date: z.date().nullish(),
  from: z.string().nullish(),
  subject: z.string().nullish(),
  textBody: z.string().nullish(),
})
export const UpdateProjectRecordEmailSchema = ProjectRecordEmailSchema.merge(
  z.object({ id: z.number() }),
)

export const DeleteProjectRecordEmailSchema = z.object({
  id: z.number(),
})

export const ProjectRecordEmailFormSchema = z.object({
  text: z.string().min(1, { message: "E-Mail-Inhalt ist ein Pflichtfeld." }),
  projectId: InputNumberOrNullSchema,
})
