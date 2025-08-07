import { ProjectSlugRequiredSchema } from "@/src/authorization/extractProjectSlug"
import { InputNumberOrNullSchema } from "@/src/core/utils"
import { z } from "zod"

export const ProtocolSchema = z.object({
  // todo not nullable but required
  // todo tbd zod update v4
  date: z.coerce.date({
    // `coerce` makes it that we need to work around a nontranslatable error
    // Thanks to https://github.com/colinhacks/zod/discussions/1851#discussioncomment-4649675
    errorMap: ({ code }, { defaultError }) => {
      if (code == "invalid_date") return { message: "Das Datum ist nicht richtig formatiert." }
      return { message: defaultError }
    },
  }),
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  description: z.string().nullish(),
  subsectionId: InputNumberOrNullSchema,
  // copied from SUbsubsection m2m2
  // LIST ALL m2mFields HERE
  // We need to do this manually, since dynamic zod types don't work
  protocolTopics: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
})

export const UpdateProtocolSchema = ProtocolSchema.merge(
  ProjectSlugRequiredSchema.merge(
    z.object({
      id: z.number(),
    }),
  ),
)

export const DeleteProtocolSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    id: z.number(),
  }),
)
