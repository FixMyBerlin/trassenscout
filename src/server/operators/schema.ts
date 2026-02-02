import { InputNumberSchema, SlugSchema } from "@/src/core/utils/schema-shared"
import { z } from "zod"

export const OperatorSchema = z.object({
  order: InputNumberSchema,
  slug: SlugSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  projectId: z.coerce.number(),
})

type TOperatorSchema = z.infer<typeof OperatorSchema>
