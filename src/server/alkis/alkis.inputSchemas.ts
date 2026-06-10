import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"

export const GetAlkisWfsParcelsSchema = ProjectSlugRequiredSchema.extend({
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  count: z.number().int().min(1).max(10_000).default(5000),
})
