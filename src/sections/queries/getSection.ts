import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"

const GetSectionSchema = z.object({
  // This accepts type of undefined, but is required at runtime
  projectSlug: z.string().optional().refine(Boolean, "Required"),
  sectionSlug: z.string().optional().refine(Boolean, "Required"),
})

const getProjectId = async (input: Record<string, any>): Promise<number> =>
  (
    await db.section.findFirstOrThrow({
      where: { slug: input.sectionSlug || null, project: { slug: input.projectSlug || null } },
      select: { projectId: true },
    })
  ).projectId

export default resolver.pipe(
  resolver.zod(GetSectionSchema),
  authorizeProjectAdmin(getProjectId),
  async ({ sectionSlug, projectSlug }) => {
    const section = await db.section.findFirst({
      where: { slug: sectionSlug, project: { slug: projectSlug } },
    })
    if (!section) throw new NotFoundError()
    return section
  }
)
