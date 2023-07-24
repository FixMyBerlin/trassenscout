import { z } from "zod"
import { SlugSchema } from "src/core/utils"

export const OperatorSchema = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  projectId: z.coerce.number(),
})

type TOperatorSchema = z.infer<typeof OperatorSchema>
