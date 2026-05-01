import db from "@/db"
import { MarkdownMail } from "@/emails/templats/MarkdownMail"
import { render } from "@react-email/components"
import { EmailTemplateKey, getEmailTemplateDefinition } from "./registry"
import {
  EmailTemplateEditableContent,
  EmailTemplatePreviewResult,
  EmailTemplateValidationResult,
  EmailTemplateVariableContext,
  RenderedEmailTemplate,
  ResolvedEmailTemplate,
} from "./types"

const PLACEHOLDER_REGEX = /{{\s*([a-zA-Z0-9_]+)\s*}}/g

const normalizeOptionalString = (value: string | null | undefined) =>
  value == null || value === "" ? undefined : value

const extractVariablesFromString = (value: string | null | undefined): string[] => {
  if (!value) return []

  const variables = new Set<string>()

  for (const match of value.matchAll(PLACEHOLDER_REGEX)) {
    const variable = match[1]?.trim()
    if (variable) variables.add(variable)
  }

  return Array.from(variables)
}

export const extractEmailTemplateVariables = (content: EmailTemplateEditableContent): string[] => {
  return Array.from(
    new Set([
      ...extractVariablesFromString(content.subject),
      ...extractVariablesFromString(content.introMarkdown),
      ...extractVariablesFromString(content.outroMarkdown),
      ...extractVariablesFromString(content.ctaText),
    ]),
  )
}

export const validateEmailTemplateContent = (
  allowedVariables: string[],
  content: EmailTemplateEditableContent,
): EmailTemplateValidationResult => {
  const usedVariables = extractEmailTemplateVariables(content)
  const allowedSet = new Set(allowedVariables)
  const unknownVariables = usedVariables.filter((variable) => !allowedSet.has(variable))

  return {
    allowedVariables,
    usedVariables,
    unknownVariables,
    isValid: unknownVariables.length === 0,
  }
}

const renderTemplateString = (
  value: string | null | undefined,
  context: EmailTemplateVariableContext,
): string | undefined => {
  if (!value) return undefined

  return value.replace(PLACEHOLDER_REGEX, (_, variableName: string) => {
    return context[variableName]?.toString() ?? ""
  })
}

export const renderEmailTemplateContent = (
  content: EmailTemplateEditableContent,
  context: EmailTemplateVariableContext,
) => {
  return {
    subject: renderTemplateString(content.subject, context) ?? "",
    introMarkdown: renderTemplateString(content.introMarkdown, context) ?? "",
    outroMarkdown: renderTemplateString(content.outroMarkdown, context),
    ctaText: renderTemplateString(content.ctaText, context),
  }
}

export const resolveEmailTemplate = async (key: EmailTemplateKey): Promise<ResolvedEmailTemplate> => {
  const definition = getEmailTemplateDefinition(key)

  const dbTemplate = await db.emailTemplate.findUnique({
    where: { key },
    select: {
      subject: true,
      introMarkdown: true,
      outroMarkdown: true,
      ctaText: true,
    },
  })

  if (!dbTemplate) {
    return {
      key,
      definition,
      source: "defaults",
      subject: definition.defaults.subject,
      introMarkdown: definition.defaults.introMarkdown,
      outroMarkdown: normalizeOptionalString(definition.defaults.outroMarkdown),
      ctaText: normalizeOptionalString(definition.defaults.ctaText),
    }
  }

  return {
    key,
    definition,
    source: "db",
    subject: dbTemplate.subject,
    introMarkdown: dbTemplate.introMarkdown,
    outroMarkdown: normalizeOptionalString(dbTemplate.outroMarkdown),
    ctaText: normalizeOptionalString(dbTemplate.ctaText),
  }
}

export const resolveAndRenderEmailTemplate = async (
  key: EmailTemplateKey,
  context: EmailTemplateVariableContext,
): Promise<RenderedEmailTemplate> => {
  const resolvedTemplate = await resolveEmailTemplate(key)
  const validation = validateEmailTemplateContent(
    resolvedTemplate.definition.allowedVariables,
    resolvedTemplate,
  )

  return {
    ...resolvedTemplate,
    ...validation,
    rendered: renderEmailTemplateContent(resolvedTemplate, context),
  }
}

export const validateAndRenderEmailTemplateContent = (
  key: EmailTemplateKey,
  content: EmailTemplateEditableContent,
  context: EmailTemplateVariableContext,
): RenderedEmailTemplate => {
  const definition = getEmailTemplateDefinition(key)
  const validation = validateEmailTemplateContent(definition.allowedVariables, content)

  return {
    key,
    definition,
    source: "db",
    ...content,
    ...validation,
    rendered: renderEmailTemplateContent(content, context),
  }
}

export const buildEmailTemplatePreview = async (
  key: EmailTemplateKey,
  content: EmailTemplateEditableContent,
  context: EmailTemplateVariableContext,
): Promise<EmailTemplatePreviewResult> => {
  const renderedTemplate = validateAndRenderEmailTemplateContent(key, content, context)

  const htmlProps = renderedTemplate.rendered.ctaText
    ? {
        introMarkdown: renderedTemplate.rendered.introMarkdown,
        outroMarkdown: renderedTemplate.rendered.outroMarkdown,
        ctaText: renderedTemplate.rendered.ctaText,
        ctaLink: "#preview-generated-in-code",
      }
    : {
        introMarkdown: renderedTemplate.rendered.introMarkdown,
        outroMarkdown: renderedTemplate.rendered.outroMarkdown,
      }

  const html = await render(
    <MarkdownMail {...htmlProps} />,
  )

  return {
    ...renderedTemplate,
    html,
  }
}
