import { resolver } from "@blitzjs/rpc"
import { resolveEmailTemplate } from "../render"
import { EmailTemplateByKeySchema } from "../schema"

export default resolver.pipe(
  resolver.zod(EmailTemplateByKeySchema),
  resolver.authorize("ADMIN"),
  async ({ key }) => {
    const resolved = await resolveEmailTemplate(key)

    return {
      key: resolved.key,
      name: resolved.definition.name,
      description: resolved.definition.description,
      supportsCta: resolved.definition.supportsCta,
      allowedVariables: resolved.definition.allowedVariables,
      sampleContext: resolved.definition.sampleContext,
      source: resolved.source,
      subject: resolved.subject,
      introMarkdown: resolved.introMarkdown,
      outroMarkdown: resolved.outroMarkdown ?? "",
      ctaText: resolved.definition.supportsCta ? (resolved.ctaText ?? "") : "",
    }
  },
)
