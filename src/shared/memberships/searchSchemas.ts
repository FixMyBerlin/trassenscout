import { z } from "zod"

export const membershipsSearchSchema = z.object({
  user: z.string().optional(),
  project: z.string().optional(),
})

export type MembershipsSearch = z.infer<typeof membershipsSearchSchema>
