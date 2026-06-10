import { z } from "zod"

export const ProjectRecordTopicSchema = z.object({
  title: z.string(),
  projectId: z.coerce.number(),
})
