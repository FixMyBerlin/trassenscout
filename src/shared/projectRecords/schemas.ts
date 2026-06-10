import { z } from "zod"
import { InputNumberOrNullSchema } from "@/src/components/core/utils/schema-shared"
import {
  ProjectRecordEditingState,
  ProjectRecordReviewState,
  ProjectRecordType,
} from "@/src/prisma/generated/client"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { NullableDateSchema, NullableDateSchemaForm } from "@/src/shared/subsubsections/schemas"

const m2mFormFields = {
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
}

const ProjectRecordSchema = z.object({
  date: NullableDateSchema,
  title: z.string().min(2, { error: "Pflichtfeld. Mindestens 2 Zeichen." }),
  body: z.string().nullish(),
  subsubsectionId: InputNumberOrNullSchema,
  acquisitionAreaId: InputNumberOrNullSchema,
  assignedToId: InputNumberOrNullSchema,
  userId: InputNumberOrNullSchema,
  projectRecordAuthorType: z.enum(ProjectRecordType),
  updatedById: InputNumberOrNullSchema,
  projectRecordUpdatedByType: z.enum(ProjectRecordType),
  projectRecordEmailId: InputNumberOrNullSchema,
  projectId: z.number(),
  reviewState: z.enum(ProjectRecordReviewState),
  reviewedAt: z.date().nullish(),
  reviewedById: InputNumberOrNullSchema,
  reviewNotes: z.string().nullish(),
  editingState: z.enum(ProjectRecordEditingState),
  projectRecordTopics: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
  uploads: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
  subsubsections: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
  acquisitionAreas: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
})

export const DeleteProjectRecordSchema = ProjectSlugRequiredSchema.extend({
  id: z.number(),
})

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
}).extend({
  date: NullableDateSchemaForm,
  ...m2mFormFields,
})

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
}).extend({
  date: NullableDateSchemaForm,
  ...m2mFormFields,
})
