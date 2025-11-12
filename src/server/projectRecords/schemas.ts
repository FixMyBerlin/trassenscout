import { ProjectSlugRequiredSchema } from "@/src/authorization/extractProjectSlug"
import { InputNumberOrNullSchema } from "@/src/core/utils"
import { NullableDateSchema, NullableDateSchemaForm } from "@/src/server/subsubsections/schema"
import { ProjectRecordReviewState, ProjectRecordType } from "@prisma/client"
import { z } from "zod"

export const ProjectRecordSchema = z.object({
  // todo not nullable but required
  // todo tbd zod update v4
  date: NullableDateSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  body: z.string().nullish(),
  subsectionId: InputNumberOrNullSchema,
  subsubsectionId: InputNumberOrNullSchema,
  userId: InputNumberOrNullSchema,
  projectRecordAuthorType: z.nativeEnum(ProjectRecordType),
  updatedById: InputNumberOrNullSchema,
  projectRecordUpdatedByType: z.nativeEnum(ProjectRecordType),
  projectRecordEmailId: InputNumberOrNullSchema,
  projectId: z.number(),
  // Review fields
  reviewState: z.nativeEnum(ProjectRecordReviewState),
  reviewedAt: z.date().nullish(),
  reviewedById: InputNumberOrNullSchema,
  reviewNotes: z.string().nullish(),
  // copied from SUbsubsection m2m2
  // LIST ALL m2mFields HERE
  // We need to do this manually, since dynamic zod types don't work
  projectRecordTopics: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
  uploads: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
})

export const DeleteProjectRecordSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    id: z.number(),
  }),
)

export const ProjectRecordFormSchema = ProjectRecordSchema.omit({
  date: true,
  projectRecordTopics: true,
  uploads: true,
  userId: true,
  projectRecordAuthorType: true,
  updatedById: true,
  projectRecordUpdatedByType: true,
  reviewedAt: true,
  reviewedById: true,
  reviewState: true,
  reviewNotes: true,
}).merge(
  z.object({
    date: NullableDateSchemaForm,
    // LIST ALL m2mFields HERE
    // We need to do this manually, since dynamic zod types don't work
    projectRecordTopics: z
      .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
      .transform((v) => v || []),
    uploads: z
      .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
      .transform((v) => v || []),
  }),
)

export const ProjectRecordUpdateAdminFormSchema = ProjectRecordFormSchema.merge(
  z.object({
    projectId: z.coerce.number(),
  }),
)

export const ProjectRecordReviewFormSchema = ProjectRecordSchema.pick({
  reviewState: true,
  reviewNotes: true,
})
