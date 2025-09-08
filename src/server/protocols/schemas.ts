import { ProjectSlugRequiredSchema } from "@/src/authorization/extractProjectSlug"
import { InputNumberOrNullSchema } from "@/src/core/utils"
import { NullableDateSchema, NullableDateSchemaForm } from "@/src/server/subsubsections/schema"
import { ProtocolReviewState, ProtocolType } from "@prisma/client"
import { z } from "zod"

export const ProtocolSchema = z.object({
  // todo not nullable but required
  // todo tbd zod update v4
  date: NullableDateSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  body: z.string().nullish(),
  subsectionId: InputNumberOrNullSchema,
  userId: InputNumberOrNullSchema,
  protocolAuthorType: z.nativeEnum(ProtocolType).default(ProtocolType.SYSTEM),
  updatedById: InputNumberOrNullSchema,
  protocolUpdatedByType: z.nativeEnum(ProtocolType).default(ProtocolType.SYSTEM),
  protocolEmailId: InputNumberOrNullSchema,
  projectId: z.number(),
  // Review fields
  reviewState: z.nativeEnum(ProtocolReviewState).default(ProtocolReviewState.NEEDSREVIEW),
  reviewedAt: z.date().nullish(),
  reviewedById: InputNumberOrNullSchema,
  reviewNotes: z.string().nullish(),
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
  userId: true,
  protocolAuthorType: true,
  updatedById: true,
  protocolUpdatedByType: true,
  reviewedAt: true,
  reviewedById: true,
  reviewState: true,
  reviewNotes: true,
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

export const ProtocolUpdateAdminFormSchema = ProtocolFormSchema.merge(
  z.object({
    projectId: z.coerce.number(),
  }),
)

export const ProtocolReviewFormSchema = ProtocolSchema.pick({
  reviewState: true,
  reviewNotes: true,
})
