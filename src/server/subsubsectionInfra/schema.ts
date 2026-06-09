import { SlugSchema } from "@/src/core/utils/schema-shared"
import { z } from "zod"

export const SubsubsectionInfra = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  projectId: z.coerce.number(),
})

type TSubsubsectionInfra = z.infer<typeof SubsubsectionInfra>

/** Empty form state for AppField typing + `form.reset()`. */
export const subsubsectionInfraFormDefaultValues: z.infer<typeof SubsubsectionInfra> = {
  slug: "",
  title: "",
  projectId: 0,
}
