import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { CreateProjectRecordCommentSchema } from "./schemas"

export const GetProjectRecordCommentsSchema = ProjectSlugRequiredSchema.extend({
  projectRecordId: z.number().optional(),
})
export const CreateProjectRecordCommentBySlugSchema = ProjectSlugRequiredSchema.and(
  CreateProjectRecordCommentSchema,
)
export const UpdateProjectRecordCommentSchema = ProjectSlugRequiredSchema.extend({
  id: z.number(),
  body: CreateProjectRecordCommentSchema.shape.body,
})
export const DeleteProjectRecordCommentSchema = ProjectSlugRequiredSchema.extend({ id: z.number() })
