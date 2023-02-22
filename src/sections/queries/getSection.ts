import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"

const GetSectionSchema = z.object({
  // This accepts type of undefined, but is required at runtime
  sectionSlug: z.string().optional().refine(Boolean, "Required"),
  projectSlug: z.string().optional().refine(Boolean, "Required"),
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
  async ({ sectionSlug, projectSlug }) =>
    await db.section.findFirstOrThrow({
      where: { slug: sectionSlug, project: { slug: projectSlug } },
    })
)
