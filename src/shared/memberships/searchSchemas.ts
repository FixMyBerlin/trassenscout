import { z } from "zod"

export const membershipNewSearchSchema = z.object({
  userId: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => (value === undefined ? undefined : String(value))),
})
