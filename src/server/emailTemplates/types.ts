import { Prettify } from "@/src/components/core/types"
import { EmailTemplateDefinition, EmailTemplateKey } from "@/src/shared/emailTemplates/registry"

export type EmailTemplateEditableContent = {
  subject: string
  introMarkdown: string
  outroMarkdown?: string | null
  ctaText?: string | null
}

export type EmailTemplateVariableContext = Record<string, string | null | undefined>

type EmailTemplateSource = "db" | "defaults"

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
  htmlFields: string[]
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

export type EmailTemplatePreviewResult = Prettify<
  RenderedEmailTemplate & {
    html: string
  }
>
