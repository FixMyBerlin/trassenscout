import { RenderedEmailTemplate } from "@/src/server/emailTemplates/types"
import { Mail } from "./types"

export const assertValidRenderedTemplate = (template: RenderedEmailTemplate) => {
  if (template.isValid) return

  const unknownVariablesText =
    template.unknownVariables.length > 0
      ? `unknown variables: ${template.unknownVariables.join(", ")}`
      : null
  const htmlFieldsText =
    template.htmlFields.length > 0 ? `invalid HTML fields: ${template.htmlFields.join(", ")}` : null

  throw new Error(
    `Invalid email template "${template.key}" (${[unknownVariablesText, htmlFieldsText].filter(Boolean).join("; ")})`,
  )
}

type BuildTemplateMailParams = {
  from: Mail["From"]
  to: Mail["To"]
  template: RenderedEmailTemplate
  ctaLink?: string
}

export const buildTemplateMail = ({
  from,
  to,
  template,
  ctaLink,
}: BuildTemplateMailParams): Mail => {
  const baseMail: Mail = {
    From: from,
    To: to,
    Subject: template.rendered.subject,
    introMarkdown: template.rendered.introMarkdown,
    outroMarkdown: template.rendered.outroMarkdown,
  }

  if (!template.rendered.ctaText || !ctaLink) return baseMail

  return {
    ...baseMail,
    ctaLink,
    ctaText: template.rendered.ctaText,
  }
}
