import { z } from "zod"
import { SlugSchema } from "@/src/components/core/utils/schema-shared"

export const SubsubsectionSpecial = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { error: "Pflichtfeld. Mindestens 2 Zeichen." }),
  projectId: z.coerce.number(),
})

export const subsubsectionSpecialFormDefaultValues: z.infer<typeof SubsubsectionSpecial> = {
  slug: "",
  title: "",
  projectId: 0,
}
