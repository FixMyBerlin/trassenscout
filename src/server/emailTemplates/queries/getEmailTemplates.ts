import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { emailTemplateDefinitions } from "../registry"

export default resolver.pipe(resolver.authorize("ADMIN"), async () => {
  const dbTemplates = await db.emailTemplate.findMany({
    select: {
      key: true,
      updatedAt: true,
      updatedById: true,
    },
    orderBy: { key: "asc" },
  })

  const dbTemplateMap = new Map(dbTemplates.map((template) => [template.key, template]))

  return emailTemplateDefinitions.map((definition) => {
    const dbTemplate = dbTemplateMap.get(definition.key)

    return {
      key: definition.key,
      name: definition.name,
      description: definition.description,
      allowedVariables: definition.allowedVariables,
      sampleContext: definition.sampleContext,
      source: dbTemplate ? "db" : ("defaults" as const),
      updatedAt: dbTemplate?.updatedAt ?? null,
      updatedById: dbTemplate?.updatedById ?? null,
    }
  })
})
