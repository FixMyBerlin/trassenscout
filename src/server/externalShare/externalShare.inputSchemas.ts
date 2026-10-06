import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"

export const GetExternalShareSchema = ProjectSlugRequiredSchema
export const RotateExternalShareTokenSchema = ProjectSlugRequiredSchema
export const RemoveUploadFromExternalShareSchema = ProjectSlugRequiredSchema.extend({
  id: z.number().int().positive(),
})
export const GetPublicExternalShareSchema = z.object({ token: z.string() })
