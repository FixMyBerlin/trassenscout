import { InputNumberOrNullSchema } from "@/src/core/utils"
import { z } from "zod"

export const UploadSchema = z.object({
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  summary: z.string().nullable(),
  subsectionId: InputNumberOrNullSchema,
  protocolEmailId: InputNumberOrNullSchema,
  subsubsectionId: InputNumberOrNullSchema, // TODO Make this more fancy and guard against a case where both subsectionId and subsubsectionId are given
  externalUrl: z.string().url(),
  // m2mFields
  protocols: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
})

export const UploadFormSchema = UploadSchema.omit({
  protocols: true,
}).merge(
  z.object({
    // LIST ALL m2mFields HERE
    // We need to do this manually, since dynamic zod types don't work
    protocols: z
      .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
      .transform((v) => v || []),
  }),
)

type TUploadSchema = z.infer<typeof UploadSchema>
