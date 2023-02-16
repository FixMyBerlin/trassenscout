import { z } from "zod"
import { SlugSchema } from "../core/utils"

export const FileSchema = z.object({
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  externalUrl: z.string().url(),
  projectSlug: SlugSchema,
})
