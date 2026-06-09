import { SlugSchema } from "@/src/core/utils/schema-shared"
import { z } from "zod"

export const QualityLevelSchema = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  url: z
    .union([
      z.string().url({ message: "Ungültige URL." }).optional().or(z.literal("")),
      // The form sumits `""` so in order to allow the field to be empty, this union is needed.
      z.literal(""),
    ])
    .nullable(),
  projectId: z.coerce.number(),
})

type TQualityLevelSchema = z.infer<typeof QualityLevelSchema>

/** Empty form state for AppField typing + `form.reset()`. Annotated so all keys stay required for TanStack. */
export const qualityLevelFormDefaultValues: z.infer<typeof QualityLevelSchema> = {
  slug: "",
  title: "",
  url: "",
  projectId: 0,
}
