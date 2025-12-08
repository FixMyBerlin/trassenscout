import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { GetSubsectionSchema, TGetSubsection } from "./getSubsection"

export type SubsectionWithSubsubsectionsWithPosition = TGetSubsection & {
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
    // Hint: We cannot use `typeSubsectionGeometry` here due to the subsubsection geometry which is not handled by the helper
    return subsection as SubsectionWithSubsubsectionsWithPosition // Tip: Validate type shape with `satisfies`
  },
)
