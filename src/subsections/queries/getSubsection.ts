import { resolver } from "@blitzjs/rpc"
import { Position } from "@turf/helpers"
import { NotFoundError } from "blitz"
import db, { Subsection } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { Prettify } from "src/core/types"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"
import { z } from "zod"

// We lie with TypeScript here, because we know better. All `geometry` fields are Position. We make sure of that in our Form. They are also required, so never empty.
export type SubsectionWithPosition = Omit<Subsection, "geometry"> & {
  geometry: [number, number][] // Position[]
}

export const GetSubsectionSchema = z.object({
  projectSlug: z.string(),
  sectionSlug: z.string(),
  subsectionSlug: z.string(),
})

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
    }
    const subsection = await db.subsection.findFirst(query)
    if (!subsection) throw new NotFoundError()
    return subsection as SubsectionWithPosition // Tip: Validate type shape with `satisfies`
  }
)
