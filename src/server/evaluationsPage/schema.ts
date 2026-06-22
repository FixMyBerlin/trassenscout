import { z } from "zod"

export const EvaluationsPageFormSchema = z.object({
  title: z.string().min(1, "Pflichtfeld"),
  markdown: z.string().min(1, "Pflichtfeld"),
})

export type EvaluationsPageFormValues = z.infer<typeof EvaluationsPageFormSchema>
