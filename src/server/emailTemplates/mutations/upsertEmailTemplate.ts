import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { validateEmailTemplateContent } from "../render"
import { getEmailTemplateDefinition } from "../registry"
import { UpsertEmailTemplateSchema } from "../schema"

const normalizeOptionalString = (value: string | undefined) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export default resolver.pipe(
  resolver.zod(UpsertEmailTemplateSchema),
  resolver.authorize("ADMIN"),
  async ({ key, subject, introMarkdown, outroMarkdown, ctaText }, ctx) => {
    const definition = getEmailTemplateDefinition(key)
    const normalizedCtaText = definition.supportsCta ? ctaText : undefined
    const content = {
      subject,
      introMarkdown,
      outroMarkdown,
      ctaText: normalizedCtaText,
    }

    const validation = validateEmailTemplateContent(definition.allowedVariables, content)
    if (!validation.isValid) {
      if (validation.unknownVariables.length > 0) {
        throw new Error(`Unknown template variables: ${validation.unknownVariables.join(", ")}`)
      }

      if (validation.htmlFields.length > 0) {
        throw new Error(
          `Raw HTML is not allowed in: ${validation.htmlFields.join(", ")}. Please use Markdown only.`,
        )
      }
    }

    return await db.emailTemplate.upsert({
      where: { key },
      update: {
        subject,
        introMarkdown,
        outroMarkdown: normalizeOptionalString(outroMarkdown),
        ctaText: normalizeOptionalString(normalizedCtaText),
        updatedById: ctx.session.userId,
      },
      create: {
        key,
        subject,
        introMarkdown,
        outroMarkdown: normalizeOptionalString(outroMarkdown),
        ctaText: normalizeOptionalString(normalizedCtaText),
        updatedById: ctx.session.userId,
      },
    })
  },
)
