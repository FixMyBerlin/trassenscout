import { z } from "zod"
import { sanitizeInternalReturnPath } from "@/src/shared/routing/sanitizeReturnTo"

export const uploadEditSearchSchema = z.object({
  returnTo: z
    .string()
    .optional()
    .transform((value) => sanitizeInternalReturnPath(value)),
  returnProjectRecordId: z.string().optional(),
})
