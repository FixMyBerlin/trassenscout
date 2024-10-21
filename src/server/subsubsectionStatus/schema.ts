import { SlugSchema } from "@/src/core/utils"
import { z } from "zod"

export const SubsubsectionStatus = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  projectId: z.coerce.number(),
})

type TSubsubsectionStatus = z.infer<typeof SubsubsectionStatus>
