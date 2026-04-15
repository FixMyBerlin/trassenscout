import { z } from "zod"

export const CreateProjectRecordCommentSchema = z.object({
  projectRecordId: z.number(),
  body: z.string(),
})
