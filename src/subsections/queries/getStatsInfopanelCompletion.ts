import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"
import { GetSubsectionSchema, SubsectionWithPosition } from "./getSubsection"

type SubsectionWithPositionWithSubsubsections = {
  subsection: SubsectionWithPosition & {
    subsubsections: {
      id: number
      estimatedCompletionDate: Date | null
      slug: string
    }[]
  }
}

export default resolver.pipe(
  resolver.zod(GetSubsectionSchema),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, subsectionSlug }) => {
    const query = {
      where: {
        slug: subsectionSlug,
        project: {
          slug: projectSlug,
        },
      },
      include: {
        subsubsections: {
          select: { estimatedCompletionDate: true, slug: true, id: true },
          orderBy: { slug: "asc" as Prisma.SortOrder },
        },
      },
    }

    const subsection = await db.subsection.findFirst(query)
    if (!subsection) throw new NotFoundError()

    return {
      subsection,
    } as SubsectionWithPositionWithSubsubsections
  },
)
