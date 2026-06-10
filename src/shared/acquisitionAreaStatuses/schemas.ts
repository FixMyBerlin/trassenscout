import { z } from "zod"
import { SlugSchema } from "@/src/components/core/utils/schema-shared"

export const AcquisitionAreaStatus = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { error: "Pflichtfeld. Mindestens 2 Zeichen." }),
  style: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  projectId: z.coerce.number(),
})

export const AcquisitionAreaStatusFormSchema = z.object({
  slug: z.string().min(1, { error: "Pflichtfeld." }),
  title: z.string().min(2, { error: "Pflichtfeld. Mindestens 2 Zeichen." }),
  style: z.union([z.literal("1"), z.literal("2"), z.literal("3"), z.literal("4")]),
})

export type AcquisitionAreaStatusFormValues = z.infer<typeof AcquisitionAreaStatusFormSchema>

export const acquisitionAreaStatusFormDefaultValues: AcquisitionAreaStatusFormValues = {
  slug: "",
  title: "",
  style: "1",
}
