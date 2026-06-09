import { ProjectSlugRequiredSchema } from "@/src/authorization/extractProjectSlug"
import { InputNumberOrNullSchema } from "@/src/core/utils/schema-shared"
import { NullableDateSchema, NullableDateSchemaForm } from "@/src/server/subsubsections/schema"
import {
  ProjectRecordEditingState,
  ProjectRecordReviewState,
  ProjectRecordType,
} from "@prisma/client"
import { z } from "zod"

export const ProjectRecordSchema = z.object({
  // todo not nullable but required
  // todo tbd zod update v4
  date: NullableDateSchema,
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  body: z.string().nullish(),
  subsubsectionId: InputNumberOrNullSchema,
  acquisitionAreaId: InputNumberOrNullSchema,
  assignedToId: InputNumberOrNullSchema,
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
  editingState: z.nativeEnum(ProjectRecordEditingState),
  // copied from SUbsubsection m2m2
  // LIST ALL m2mFields HERE
  // We need to do this manually, since dynamic zod types don't work
  projectRecordTopics: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
  uploads: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
  subsubsections: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
  acquisitionAreas: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
})

export const DeleteProjectRecordSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    id: z.number(),
  }),
)

export const newProjectRecordFormDefaultValues = {
  date: "",
  title: "",
  body: "",
  subsubsectionId: null as number | null,
  acquisitionAreaId: null as number | null,
  assignedToId: null as number | null,
  editingState: ProjectRecordEditingState.PENDING,
  projectRecordTopics: [] as string[],
  uploads: [] as string[],
  subsubsections: [] as string[],
  acquisitionAreas: [] as string[],
}

export const NewProjectRecordFormSchema = ProjectRecordSchema.omit({
  date: true,
  projectRecordTopics: true,
  uploads: true,
  userId: true,
  projectRecordAuthorType: true,
  updatedById: true,
  projectRecordUpdatedByType: true,
  reviewedAt: true,
  reviewNotes: true,
  reviewState: true,
  reviewedById: true,
  projectId: true,
  projectRecordEmailId: true,
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
    subsubsections: z
      .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
      .transform((v) => v || []),
    acquisitionAreas: z
      .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
      .transform((v) => v || []),
  }),
)

export const projectRecordFormDefaultValues = {
  date: "",
  title: "",
  body: "",
  subsubsectionId: null as number | null,
  acquisitionAreaId: null as number | null,
  assignedToId: null as number | null,
  editingState: ProjectRecordEditingState.PENDING,
  reviewState: ProjectRecordReviewState.NEEDSREVIEW,
  reviewNotes: "",
  projectRecordTopics: [] as string[],
  uploads: [] as string[],
  subsubsections: [] as string[],
  acquisitionAreas: [] as string[],
}

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
  projectId: true,
  projectRecordEmailId: true,
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
    subsubsections: z
      .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
      .transform((v) => v || []),
    acquisitionAreas: z
      .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
      .transform((v) => v || []),
  }),
)
