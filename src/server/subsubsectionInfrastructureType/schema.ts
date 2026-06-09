import { SlugSchema } from "@/src/core/utils/schema-shared"
import { z } from "zod"

export const SubsubsectionInfrastructureType = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  projectId: z.coerce.number(),
})

type TSubsubsectionInfrastructureType = z.infer<typeof SubsubsectionInfrastructureType>

/** Empty form state for AppField typing + `form.reset()`. */
export const subsubsectionInfrastructureTypeFormDefaultValues: z.infer<
  typeof SubsubsectionInfrastructureType
> = {
  slug: "",
  title: "",
  projectId: 0,
}
