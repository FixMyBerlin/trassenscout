import { z } from "zod"

export const FileSchema = z.object({
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  subsectionId: z.coerce.number().nullable(),
  subsubsectionId: z.coerce.number().nullable(), // TODO Make this more fancy and guard against a case where both subsectionId and subsubsectionId are given
  externalUrl: z.string().url(),
})

type TFileSchema = z.infer<typeof FileSchema>
