import { z } from "zod"
import { ProjectRecordEditingState } from "@/src/prisma/generated/browser"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import {
  DeleteProjectRecordSchema,
  NewProjectRecordFormSchema,
  PatchProjectRecordAssignmentSchema,
  ProjectRecordFormSchema,
} from "@/src/shared/projectRecords/schemas"

export const GetProjectRecordAdminSchema = z.object({ id: z.number() })

export const GetProjectRecordsSchema = ProjectSlugRequiredSchema
export const GetProjectRecordSchema = ProjectSlugRequiredSchema.extend({ id: z.number() })
export const GetProjectRecordsBySubsubsectionSchema = ProjectSlugRequiredSchema.extend({
  subsubsectionId: z.number(),
})
export const GetProjectRecordsByAcquisitionAreaSchema = ProjectSlugRequiredSchema.extend({
  acquisitionAreaId: z.number(),
})
export const CreateProjectRecordBySlugSchema = ProjectSlugRequiredSchema.and(
  NewProjectRecordFormSchema,
)
export const UpdateProjectRecordBySlugSchema = ProjectSlugRequiredSchema.extend({
  id: z.number(),
}).and(ProjectRecordFormSchema)
export const DeleteProjectRecordBySlugSchema = DeleteProjectRecordSchema
export const DeleteProjectRecordWithUploadsDecisionSchema = ProjectSlugRequiredSchema.extend({
  id: z.number(),
  keepUploadIds: z.array(z.number()),
})
export { PatchProjectRecordAssignmentSchema }

const assignmentDirections = ["all", "byMe", "toMe"] as const

export const GetMyAssignedRecordsSchema = z.object({
  projectSlug: z.string().optional(),
  editingState: z.enum(ProjectRecordEditingState).optional(),
  direction: z.enum(assignmentDirections).default("all"),
})

export const CountMyAssignedRecordsSchema = z.object({
  projectSlug: z.string().optional(),
})
