import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { GetSubsectionSchema, SubsectionWithPosition } from "./getSubsection"

export type SubsectionWithSubsubsectionsWithPosition = SubsectionWithPosition & {
  subsubsections: SubsubsectionWithPosition[]
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
          include: { manager: true },
          orderBy: { slug: "asc" as Prisma.SortOrder },
        },
      },
    }
    const subsection = await db.subsection.findFirst(query)
    if (!subsection) throw new NotFoundError()
    return subsection as SubsectionWithSubsubsectionsWithPosition // Tip: Validate type shape with `satisfies`
  },
)
