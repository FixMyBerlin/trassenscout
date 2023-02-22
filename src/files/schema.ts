import { z } from "zod"

export const FileSchema = z.object({
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  externalUrl: z.string().url(),
})
