import { resolver } from "@blitzjs/rpc"
import { getEmailTemplateDefinition } from "../registry"
import { buildEmailTemplatePreview } from "../render"
import { UpsertEmailTemplateSchema } from "../schema"

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
