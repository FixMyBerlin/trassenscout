import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import {
  DeleteProjectRecordSchema,
  NewProjectRecordFormSchema,
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
