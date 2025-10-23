import { z } from "zod"

export const ProtocolEmailSchema = z.object({
  text: z.string().min(1, { message: "E-Mail-Inhalt ist ein Pflichtfeld." }),
  projectId: z.coerce.number(),
})
export const UpdateProtocolEmailSchema = ProtocolEmailSchema.merge(z.object({ id: z.number() }))

export const DeleteProtocolEmailSchema = z.object({
  id: z.number(),
})

export const ProtocolEmailFormSchema = ProtocolEmailSchema
