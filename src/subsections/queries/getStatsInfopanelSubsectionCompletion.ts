import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"
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
  authorizeProjectMember(extractProjectSlug, viewerRoles),
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
