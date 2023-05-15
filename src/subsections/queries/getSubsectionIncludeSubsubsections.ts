import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"
import { SubsubsectionWithPosition } from "src/subsubsections/queries/getSubsubsection"
import { GetSubsectionSchema, SubsectionWithPosition } from "./getSubsection"

export type SubsectionWithSubsubsectionsWithPosition = SubsectionWithPosition & {
  subsubsections: SubsubsectionWithPosition[]
}

export default resolver.pipe(
  resolver.zod(GetSubsectionSchema),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, sectionSlug, subsectionSlug }) => {
    const query = {
      where: {
        slug: subsectionSlug,
        section: {
          slug: sectionSlug,
          project: {
            slug: projectSlug,
          },
        },
      },
      include: { subsubsections: { include: { manager: true } } },
    }
    const subsection = await db.subsection.findFirst(query)
    if (!subsection) throw new NotFoundError()
    return subsection as SubsectionWithSubsubsectionsWithPosition // Tip: Validate type shape with `satisfies`
  }
)
