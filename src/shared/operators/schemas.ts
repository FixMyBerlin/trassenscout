import { z } from "zod"
import { InputNumberSchema, SlugSchema } from "@/src/components/core/utils/schema-shared"

export const OperatorSchema = z.object({
  order: InputNumberSchema,
  slug: SlugSchema,
  title: z.string().min(2, { error: "Pflichtfeld. Mindestens 2 Zeichen." }),
  projectId: z.coerce.number(),
})

export const operatorFormDefaultValues: z.infer<typeof OperatorSchema> = {
  slug: "",
  title: "",
  order: 0,
  projectId: 0,
}
