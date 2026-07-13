import { z } from "zod"
import { EmailTemplateKey, emailTemplateKeys } from "./registry"

const emailTemplateKeyValues = Object.values(emailTemplateKeys) as [
  EmailTemplateKey,
  ...EmailTemplateKey[],
]

const EmailTemplateKeySchema = z.enum(emailTemplateKeyValues)

export const EmailTemplateFormSchema = z.object({
  subject: z.string().min(1, "Pflichtfeld"),
  introMarkdown: z.string().min(1, "Pflichtfeld"),
  outroMarkdown: z.string().optional(),
  ctaText: z.string().optional(),
})

export const EmailTemplateByKeySchema = z.object({
  key: EmailTemplateKeySchema,
})

export const UpsertEmailTemplateSchema = EmailTemplateByKeySchema.extend(
  EmailTemplateFormSchema.shape,
)

export type EmailTemplateFormValues = z.infer<typeof EmailTemplateFormSchema>

export const emailTemplateFormDefaultValues: EmailTemplateFormValues = {
  subject: "",
  introMarkdown: "",
  outroMarkdown: "",
  ctaText: "",
}
