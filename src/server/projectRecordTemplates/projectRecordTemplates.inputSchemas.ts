import { z } from "zod"

export const GetProjectRecordTemplatesSchema = z.object({})
export const GetTagsAdminSchema = z.object({})
export const GetUploadsAdminSchema = z.object({ projectIds: z.array(z.number().int()) })
