import { z } from "zod"
import { EmailTemplateKey, emailTemplateKeys } from "./registry"

const emailTemplateKeyValues = Object.values(emailTemplateKeys) as [
  EmailTemplateKey,
  ...EmailTemplateKey[],
]

export const EmailTemplateKeySchema = z.enum(emailTemplateKeyValues)

export const EmailTemplateFormSchema = z.object({
  subject: z.string().min(1, "Pflichtfeld"),
  introMarkdown: z.string().min(1, "Pflichtfeld"),
  outroMarkdown: z.string().optional(),
  ctaText: z.string().optional(),
})

export const EmailTemplateByKeySchema = z.object({
  key: EmailTemplateKeySchema,
})

export const UpsertEmailTemplateSchema = EmailTemplateByKeySchema.merge(EmailTemplateFormSchema)

export type EmailTemplateFormValues = z.infer<typeof EmailTemplateFormSchema>
