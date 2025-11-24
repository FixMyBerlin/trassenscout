import db, { Subsection } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { LineStringGeometrySchema } from "@/src/core/utils/geojson-schemas"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { z } from "zod"

// Subsection geometry is always a LineString GeoJSON object
export type SubsectionWithPosition = Omit<Subsection, "geometry"> & {
  geometry: z.infer<typeof LineStringGeometrySchema>
} & { operator: { id: number; slug: string; title: string } | null } & {
  stakeholdernotesCounts: { relevant: number; done: number }
  subsubsectionCount: number
}

export const GetSubsectionSchema = z.object({
  projectSlug: z.string(),
  subsectionSlug: z.string(),
})

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
        operator: { select: { id: true, slug: true, title: true } },
        stakeholdernotes: { select: { id: true, status: true } },
        subsubsections: { select: { id: true } },
      },
    }
    const subsection = await db.subsection.findFirst(query)
    if (!subsection) throw new NotFoundError()

    const relevantStakeholdernotes = subsection.stakeholdernotes.filter(
      (note) => note.status !== "IRRELEVANT",
    ).length

    const doneStakeholdernotes = subsection.stakeholdernotes.filter(
      (note) => note.status === "DONE",
    ).length

    const subsubsectionCount = subsection.subsubsections.length

    // We only needed those for the counts, we don't actually want the full list to be returned
    // @ts-expect-error "The operand of a 'delete' operator must be optional.ts(2790)" is true but not relevant here
    delete subsection.stakeholdernotes
    // @ts-expect-error "The operand of a 'delete' operator must be optional.ts(2790)" is true but not relevant here
    delete subsection.subsubsections

    const subsectionWithCounts: SubsectionWithPosition = {
      ...subsection,
      geometry: subsection.geometry as z.infer<typeof LineStringGeometrySchema>,
      stakeholdernotesCounts: { relevant: relevantStakeholdernotes, done: doneStakeholdernotes },
      subsubsectionCount,
    }

    return subsectionWithCounts
  },
)
