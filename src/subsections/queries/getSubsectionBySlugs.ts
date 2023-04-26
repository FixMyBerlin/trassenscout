import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"

const GetSubsectionSchema = z.object({
  projectSlug: z.string(),
  sectionSlug: z.string(),
  slug: z.string(),
  includeSubsubsections: z.boolean().optional(),
})

export default resolver.pipe(
  resolver.zod(GetSubsectionSchema),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, sectionSlug, slug, includeSubsubsections }) => {
    let query: Prisma.SubsectionFindFirstArgs = {
      where: {
        slug,
        section: {
          slug: sectionSlug,
          project: {
            slug: projectSlug,
          },
        },
      },
    }
    if (includeSubsubsections) {
      query.include = { subsubsections: true }
    }
    return await db.subsection.findFirst(query)
  }
)
