import { SlugSchema } from "@/src/core/utils/schema-shared"
import { z } from "zod"

export const SubsubsectionTask = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  projectId: z.coerce.number(),
})

type TSubsubsectionTask = z.infer<typeof SubsubsectionTask>

/** Empty form state for AppField typing + `form.reset()`. */
export const subsubsectionTaskFormDefaultValues: z.infer<typeof SubsubsectionTask> = {
  slug: "",
  title: "",
  projectId: 0,
}
