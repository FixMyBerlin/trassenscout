import { Prettify } from "@/src/core/types"
import { EmailTemplateDefinition, EmailTemplateKey } from "./registry"

export type EmailTemplateEditableContent = {
  subject: string
  introMarkdown: string
  outroMarkdown?: string | null
  ctaText?: string | null
}

export type EmailTemplateVariableContext = Record<string, string | null | undefined>

export type EmailTemplateSource = "db" | "defaults"

export type ResolvedEmailTemplate = Prettify<
  EmailTemplateEditableContent & {
    key: EmailTemplateKey
    definition: EmailTemplateDefinition
    source: EmailTemplateSource
  }
>

export type EmailTemplateValidationResult = {
  allowedVariables: string[]
  usedVariables: string[]
  unknownVariables: string[]
  isValid: boolean
}

export type RenderedEmailTemplate = Prettify<
  ResolvedEmailTemplate &
    EmailTemplateValidationResult & {
      rendered: {
        subject: string
        introMarkdown: string
        outroMarkdown?: string
        ctaText?: string
      }
    }
>
