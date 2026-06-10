import { z } from "zod"
import { SlugSchema } from "@/src/components/core/utils/schema-shared"

export const QualityLevelSchema = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { error: "Pflichtfeld. Mindestens 2 Zeichen." }),
  url: z
    .union([
      z.url({ error: "Ungültige URL." }).optional().or(z.literal("")),
      // The form submits `""` so in order to allow the field to be empty, this union is needed.
      z.literal(""),
    ])
    .nullable(),
  projectId: z.coerce.number(),
})

export const qualityLevelFormDefaultValues: z.infer<typeof QualityLevelSchema> = {
  slug: "",
  title: "",
  url: "",
  projectId: 0,
}
