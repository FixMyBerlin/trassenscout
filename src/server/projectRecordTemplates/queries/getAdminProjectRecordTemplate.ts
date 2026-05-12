import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { ProjectRecordTemplateByIdSchema } from "../schema"

export default resolver.pipe(
  resolver.zod(ProjectRecordTemplateByIdSchema),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    const template = await db.projectRecordTemplate.findFirst({
      where: { id },
      include: {
        projects: {
          select: { id: true, slug: true },
          orderBy: { slug: "asc" },
        },
        projectRecordTopics: {
          select: {
            id: true,
            title: true,
            projectId: true,
            project: { select: { slug: true } },
          },
          orderBy: [{ projectId: "asc" }, { title: "asc" }],
        },
      },
    })

    if (!template) throw new NotFoundError()

    return template
  },
)
