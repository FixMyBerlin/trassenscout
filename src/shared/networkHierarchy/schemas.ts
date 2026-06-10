import { z } from "zod"
import { SlugSchema } from "@/src/components/core/utils/schema-shared"

export const NetworkHierarchySchema = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { error: "Pflichtfeld. Mindestens 2 Zeichen." }),
  projectId: z.coerce.number(),
})

export const networkHierarchyFormDefaultValues: z.infer<typeof NetworkHierarchySchema> = {
  slug: "",
  title: "",
  projectId: 0,
}
