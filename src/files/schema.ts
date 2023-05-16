import { z } from "zod"

export const FileSchema = z.object({
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  subsectionId: z.coerce.number().nullable(),
  externalUrl: z.string().url(),
})

type TFileSchema = z.infer<typeof FileSchema>
