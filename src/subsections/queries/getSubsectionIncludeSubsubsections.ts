import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { SubsubsectionWithPosition } from "src/subsubsections/queries/getSubsubsection"
import { GetSubsectionSchema, SubsectionWithPosition } from "./getSubsection"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"
import { viewerRoles } from "../../authorization/constants"

export type SubsectionWithSubsubsectionsWithPosition = SubsectionWithPosition & {
  subsubsections: SubsubsectionWithPosition[]
}

export default resolver.pipe(
  resolver.zod(GetSubsectionSchema),
  authorizeProjectAdmin(extractProjectSlug, viewerRoles),
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
