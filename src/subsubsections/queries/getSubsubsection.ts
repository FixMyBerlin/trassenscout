import { resolver } from "@blitzjs/rpc"
import db, { Subsubsection, SubsubsectionTypeEnum, User } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"
import { z } from "zod"

const GetSubsubsection = z.object({
  projectSlug: z.string(),
  subsectionSlug: z.string(),
  subsubsectionSlug: z.string(),
})

// We lie with TypeScript here, because we know better. All `geometry` fields are Position. We make sure of that in our Form. They are also required, so never empty.
export type SubsubsectionWithPosition = Omit<Subsubsection, "geometry"> &
  (
    | {
        type: typeof SubsubsectionTypeEnum.AREA
        geometry: [number, number] // Position
      }
    | {
        type: typeof SubsubsectionTypeEnum.ROUTE
        geometry: [number, number][] // Position[]
      }
  ) & { manager: User } & { subsection: { slug: string } }

export default resolver.pipe(
  resolver.zod(GetSubsubsection),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, subsectionSlug, subsubsectionSlug }) => {
    const query = {
      where: {
        slug: subsubsectionSlug,
        subsection: {
          slug: subsectionSlug,
          project: {
            slug: projectSlug,
          },
        },
      },
      include: {
        manager: { select: { firstName: true, lastName: true } },
        subsection: { select: { slug: true } },
      },
    }

    const subsubsection = await db.subsubsection.findFirstOrThrow(query)
    return subsubsection as SubsubsectionWithPosition // Tip: Validate type shape with `satisfies`
  },
)
