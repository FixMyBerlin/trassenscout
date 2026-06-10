import { z } from "zod"

/** Back-link URL passed through admin CRUD flows (`ConditionalBackLink`). */
export const fromBackLinkSearchSchema = z.object({
  from: z.string().optional(),
})
