import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"
import { z } from "zod"

export const GetSubsectionsSchema = z.object({
  projectSlug: z.string(),
})

type ProjectSubsectionsWithCostStructure = {
  projectLengthKm: number
  numberOfSubsections: number
  networHierarchiesSubsectionsWithCount: {
    title: string
    count: number
    lengthKm: number
  }[]
}

export default resolver.pipe(
  resolver.zod(GetSubsectionsSchema),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug }) => {
    const query = {
      where: {
        project: {
          slug: projectSlug,
        },
      },
      include: {
        subsubsections: true,
        networkHierarchy: true,
      },
    }

    const newSubsections = await db.subsection.findMany(query)

    if (!newSubsections.length) throw new NotFoundError()

    const networHierarchies = await db.networkHierarchy.findMany({
      where: {
        project: {
          slug: projectSlug,
        },
      },
    })

    const networHierarchiesSubsectionsCount = networHierarchies.map((level) => {
      return {
        title: level.title,
        count: newSubsections.filter((sub) => sub.networkHierarchyId === level.id).length,
        lengthKm: newSubsections
          .filter((sub) => sub.networkHierarchyId === level.id)
          .reduce((acc, a) => acc + (a?.lengthKm || 0), 0),
      }
    })

    return {
      projectLengthKm: newSubsections.reduce((acc, s) => acc + (s.lengthKm ?? 0), 0),
      numberOfSubsections: newSubsections.length,
      networHierarchiesSubsectionsWithCount: networHierarchiesSubsectionsCount,
    } as ProjectSubsectionsWithCostStructure
  },
)
