import { resolver } from "@blitzjs/rpc"
import { EmailTemplateByKeySchema } from "../schema"
import { resolveEmailTemplate } from "../render"

export default resolver.pipe(
  resolver.zod(EmailTemplateByKeySchema),
  resolver.authorize("ADMIN"),
  async ({ key }) => {
    const resolved = await resolveEmailTemplate(key)

    return {
      key: resolved.key,
      name: resolved.definition.name,
      description: resolved.definition.description,
      allowedVariables: resolved.definition.allowedVariables,
      sampleContext: resolved.definition.sampleContext,
      source: resolved.source,
      subject: resolved.subject,
      introMarkdown: resolved.introMarkdown,
      outroMarkdown: resolved.outroMarkdown ?? "",
      ctaText: resolved.ctaText ?? "",
    }
  },
)
