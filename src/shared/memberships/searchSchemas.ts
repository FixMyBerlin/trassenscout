import { z } from "zod"

export const membershipsSearchSchema = z.object({
  user: z.coerce.string().optional(),
  project: z.coerce.string().optional(),
})

export type MembershipsSearch = z.infer<typeof membershipsSearchSchema>
