import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"

export default resolver.pipe(
  resolver.zod(ProjectSlugRequiredSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug }) => {
    const templates = await db.projectRecordTemplate.findMany({
      where: { projects: { some: { slug: projectSlug } } },
      orderBy: [{ templateTitle: "asc" }, { id: "asc" }],
      include: {
        projectRecordTopics: {
          where: { project: { slug: projectSlug } },
          select: { id: true, title: true },
          orderBy: { title: "asc" },
        },
      },
    })

    return templates.map((template) => ({
      id: template.id,
      templateTitle: template.templateTitle,
      entryTitle: template.entryTitle,
      body: template.body,
      topicIds: template.projectRecordTopics.map((topic) => topic.id),
    }))
  },
)
