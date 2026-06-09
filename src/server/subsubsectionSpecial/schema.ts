import { SlugSchema } from "@/src/core/utils/schema-shared"
import { z } from "zod"

export const SubsubsectionSpecial = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  projectId: z.coerce.number(),
})

type TSubsubsectionSpecial = z.infer<typeof SubsubsectionSpecial>

/** Empty form state for AppField typing + `form.reset()`. */
export const subsubsectionSpecialFormDefaultValues: z.infer<typeof SubsubsectionSpecial> = {
  slug: "",
  title: "",
  projectId: 0,
}
