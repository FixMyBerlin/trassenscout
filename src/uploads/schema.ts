import { z } from "zod"

export const UploadSchema = z.object({
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  subsectionId: z.coerce.number().nullable(),
  subsubsectionId: z.coerce.number().nullable(), // TODO Make this more fancy and guard against a case where both subsectionId and subsubsectionId are given
  externalUrl: z.string().url(),
})

type TUploadSchema = z.infer<typeof UploadSchema>
