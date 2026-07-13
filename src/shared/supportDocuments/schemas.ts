import { z } from "zod"

export const SupportDocumentFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullish(),
  order: z.coerce.number().int().optional(),
  externalUrl: z.url().optional(),
  mimeType: z.string().nullable().optional(),
  fileSize: z.number().int().positive().nullable().optional(),
})

export type SupportDocumentFormType = z.infer<typeof SupportDocumentFormSchema>

export const supportDocumentFormDefaultValues: SupportDocumentFormType = {
  title: "",
  description: null,
  order: undefined,
}
