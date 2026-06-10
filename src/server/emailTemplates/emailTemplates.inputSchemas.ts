import { z } from "zod"
import { EmailTemplateByKeySchema } from "@/src/shared/emailTemplates/schemas"

export const GetEmailTemplatesSchema = z.object({})

export const DeleteEmailTemplateSchema = EmailTemplateByKeySchema
