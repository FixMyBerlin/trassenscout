import { ProjectSlugRequiredSchema } from "@/src/authorization/extractProjectSlug"
import { InputNumberOrNullSchema } from "@/src/core/utils"
import { NullableDateSchema, NullableDateSchemaForm } from "@/src/server/subsubsections/schema"
import { z } from "zod"

export const ProtocolSchema = z.object({
  // todo not nullable but required
  // todo tbd zod update v4
  date: NullableDateSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  body: z.string().nullish(),
  subsectionId: InputNumberOrNullSchema,
  // copied from SUbsubsection m2m2
  // LIST ALL m2mFields HERE
  // We need to do this manually, since dynamic zod types don't work
  protocolTopics: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
})

export const DeleteProtocolSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    id: z.number(),
  }),
)

export const ProtocolFormSchema = ProtocolSchema.omit({
  date: true,
  protocolTopics: true,
}).merge(
  z.object({
    date: NullableDateSchemaForm,
    // LIST ALL m2mFields HERE
    // We need to do this manually, since dynamic zod types don't work
    protocolTopics: z
      .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
      .transform((v) => v || []),
  }),
)
