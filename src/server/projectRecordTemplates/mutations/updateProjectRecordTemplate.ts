import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { validateTemplateTopicScope } from "../_utils/validateTemplateTopicScope"
import { UpdateProjectRecordTemplateSchema } from "../schema"

const normalizeOptionalString = (value: string | null | undefined) => {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

export default resolver.pipe(
  resolver.zod(UpdateProjectRecordTemplateSchema),
  resolver.authorize("ADMIN"),
  async ({ id, projectIds, projectRecordTopicIds, templateTitle, entryTitle, body, purpose }) => {
    const existingTemplate = await db.projectRecordTemplate.findFirst({ where: { id } })
    if (!existingTemplate) throw new NotFoundError()

    await validateTemplateTopicScope({ projectIds, projectRecordTopicIds })

    return await db.projectRecordTemplate.update({
      where: { id },
      data: {
        templateTitle: templateTitle.trim(),
        entryTitle: entryTitle.trim(),
        body: normalizeOptionalString(body),
        purpose: normalizeOptionalString(purpose),
        projects: {
          set: projectIds.map((projectId) => ({ id: projectId })),
        },
        projectRecordTopics: {
          set: projectRecordTopicIds.map((topicId) => ({ id: topicId })),
        },
      },
    })
  },
)
