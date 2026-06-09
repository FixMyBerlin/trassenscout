import { z } from "zod"

export const SupportDocumentFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullish(),
  order: z.coerce.number().int(),
})

export type SupportDocumentFormType = z.infer<typeof SupportDocumentFormSchema>

/** Empty form state for AppField typing + `form.reset()`. */
export const supportDocumentFormDefaultValues: SupportDocumentFormType = {
  title: "",
  description: "",
  order: 0,
}
