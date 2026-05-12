import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { validateTemplateTopicScope } from "../_utils/validateTemplateTopicScope"
import { CreateProjectRecordTemplateSchema } from "../schema"

const normalizeOptionalString = (value: string | null | undefined) => {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

export default resolver.pipe(
  resolver.zod(CreateProjectRecordTemplateSchema),
  resolver.authorize("ADMIN"),
  async ({ projectIds, projectRecordTopicIds, templateTitle, entryTitle, body, purpose }) => {
    await validateTemplateTopicScope({ projectIds, projectRecordTopicIds })

    return await db.projectRecordTemplate.create({
      data: {
        templateTitle: templateTitle.trim(),
        entryTitle: entryTitle.trim(),
        body: normalizeOptionalString(body),
        purpose: normalizeOptionalString(purpose),
        projects: {
          connect: projectIds.map((id) => ({ id })),
        },
        projectRecordTopics: {
          connect: projectRecordTopicIds.map((id) => ({ id })),
        },
      },
    })
  },
)
