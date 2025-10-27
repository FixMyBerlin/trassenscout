import { z } from "zod"

export const ProjectRecordEmailSchema = z.object({
  text: z.string().min(1, { message: "E-Mail-Inhalt ist ein Pflichtfeld." }),
  projectId: z.coerce.number(),
})
export const UpdateProjectRecordEmailSchema = ProjectRecordEmailSchema.merge(z.object({ id: z.number() }))

export const DeleteProjectRecordEmailSchema = z.object({
  id: z.number(),
})

export const ProjectRecordEmailFormSchema = ProjectRecordEmailSchema
