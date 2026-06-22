import { z } from "zod"

export const ProjectRecordTopicSchema = z.object({
  title: z.string().trim().min(1),
  projectId: z.coerce.number(),
})
