import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"

const GetSubsectionSchema = z.object({
  // This accepts type of undefined, but is required at runtime
  slug: z.string().optional().refine(Boolean, "Required"),
})

const getProjectId = async (input: Record<string, any>) => {
  return (
    await db.section.findFirstOrThrow({
      where: { subsections: { some: { slug: input.slug || null } } },
      select: { projectId: true },
    })
  ).projectId
}

export default resolver.pipe(
  resolver.zod(GetSubsectionSchema),
  authorizeProjectAdmin(getProjectId),
  async ({ slug }) => await db.subsection.findFirstOrThrow({ where: { slug } })
)
