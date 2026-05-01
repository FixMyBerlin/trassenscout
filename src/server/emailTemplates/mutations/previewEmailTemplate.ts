import { resolver } from "@blitzjs/rpc"
import { buildEmailTemplatePreview } from "../render"
import { UpsertEmailTemplateSchema } from "../schema"
import { getEmailTemplateDefinition } from "../registry"

export default resolver.pipe(
  resolver.zod(UpsertEmailTemplateSchema),
  resolver.authorize("ADMIN"),
  async ({ key, subject, introMarkdown, outroMarkdown, ctaText }) => {
    const definition = getEmailTemplateDefinition(key)
    const normalizedCtaText = definition.supportsCta ? ctaText : undefined

    return await buildEmailTemplatePreview(
      key,
      {
        subject,
        introMarkdown,
        outroMarkdown,
        ctaText: normalizedCtaText,
      },
      definition.sampleContext,
    )
  },
)
