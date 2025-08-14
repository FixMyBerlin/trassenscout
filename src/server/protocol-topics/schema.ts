import { z } from "zod"

export const ProtocolTopicSchema = z.object({
  title: z.string(),
  projectId: z.coerce.number(),
})
