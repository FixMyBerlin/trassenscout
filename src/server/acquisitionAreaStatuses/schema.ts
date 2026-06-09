import { SlugSchema } from "@/src/core/utils/schema-shared"
import { z } from "zod"

export const AcquisitionAreaStatus = z.object({
  slug: SlugSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  style: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  projectId: z.coerce.number(),
})

export type TAcquisitionAreaStatus = z.infer<typeof AcquisitionAreaStatus>

export const AcquisitionAreaStatusFormSchema = z.object({
  slug: z.string().min(1, { message: "Pflichtfeld." }),
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  style: z.union([z.literal("1"), z.literal("2"), z.literal("3"), z.literal("4")]),
})

export type AcquisitionAreaStatusFormValues = z.infer<typeof AcquisitionAreaStatusFormSchema>

/** Empty form state for AppField typing + `form.reset()`. */
export const acquisitionAreaStatusFormDefaultValues: AcquisitionAreaStatusFormValues = {
  slug: "",
  title: "",
  style: "1",
}
