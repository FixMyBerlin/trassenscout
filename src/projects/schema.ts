import { z } from "zod"

export const ProjectSchema = z.object({
  name: z.string(),
  shortName: z.string().nullish(),
  introduction: z.string().nullish(),
  userId: z.coerce.number(), // ownerId
})
