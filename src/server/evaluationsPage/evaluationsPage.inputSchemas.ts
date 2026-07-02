import { z } from "zod"

export const UpsertEvaluationsPageSchema = z.object({
  title: z.string().min(1, "Pflichtfeld"),
  markdown: z.string().min(1, "Pflichtfeld"),
})
