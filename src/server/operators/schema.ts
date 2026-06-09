import { InputNumberSchema, SlugSchema } from "@/src/core/utils/schema-shared"
import { z } from "zod"

export const OperatorSchema = z.object({
  order: InputNumberSchema,
  slug: SlugSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  projectId: z.coerce.number(),
})

type TOperatorSchema = z.infer<typeof OperatorSchema>

/** Empty form state for AppField typing + `form.reset()`. Annotated so all keys stay required for TanStack. */
export const operatorFormDefaultValues: z.infer<typeof OperatorSchema> = {
  slug: "",
  title: "",
  order: 0,
  projectId: 0,
}
