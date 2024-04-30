import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db, { Subsubsection } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"
import { z } from "zod"

export const GetSubsectionsSchema = z.object({
  projectSlug: z.string(),
})

type ProjectSubsectionsWithCostStructure = {
  projectLengthKm: number
  networHierarchiesSubsectionsWithCount: {
    title: string
    count: number
    lengthKm: number
  }[]
  qualityLevelsWithCount: {
    slug: string
    count: number
    lengthKm: number
    percentage: number
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
        subsubsections: { include: { qualityLevel: true } },
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
    const qualityLevels = await db.qualityLevel.findMany({
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

    // all subsubsections / Planungsabschnitte mit qulaity level / Ausbaustandard
    const subsubsectionsWithQualityLevel: Subsubsection[] = []
    newSubsections.forEach((newSubsection) => {
      const newSubsubsectionsWithQualityLevel = newSubsection?.subsubsections.filter(
        (subsubsection) => subsubsection?.qualityLevelId,
      )
      if (newSubsubsectionsWithQualityLevel.length)
        subsubsectionsWithQualityLevel.push(...newSubsubsectionsWithQualityLevel)
    })

    const subsubsectionsWithQualityLevelLengthKm = subsubsectionsWithQualityLevel.reduce(
      (acc, a) => acc + (a?.lengthKm || 0),
      0,
    )

    const qualityLevelsWithCount = qualityLevels.map((level) => {
      const subsubsectionsWithCertainQualityLevelLengthKm: number = subsubsectionsWithQualityLevel
        .filter((subsub) => subsub.qualityLevelId === level.id)
        .reduce((acc, a) => acc + (a?.lengthKm || 0), 0)
      return {
        slug: level.slug,
        count: subsubsectionsWithQualityLevel.filter((subsub) => subsub.qualityLevelId === level.id)
          .length,
        lengthKm: subsubsectionsWithCertainQualityLevelLengthKm,
        percentage:
          subsubsectionsWithCertainQualityLevelLengthKm /
          (subsubsectionsWithQualityLevelLengthKm / 100),
      }
    })

    return {
      projectLengthKm: newSubsections.reduce((acc, s) => acc + (s.lengthKm ?? 0), 0),
      networHierarchiesSubsectionsWithCount: networHierarchiesSubsectionsCount,
      qualityLevelsWithCount,
    } as ProjectSubsectionsWithCostStructure
  },
)
