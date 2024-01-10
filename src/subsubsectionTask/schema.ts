import { SlugSchema } from "src/core/utils"
import { z } from "zod"

export const SubsubsectionTask = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  projectId: z.coerce.number(),
})

type TSubsubsectionTask = z.infer<typeof SubsubsectionTask>
