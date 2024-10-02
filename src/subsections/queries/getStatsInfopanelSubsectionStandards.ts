import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { GetSubsectionSchema, SubsectionWithPosition } from "./getSubsection"

type SubsectionWithSubsubsectionsWithPositionWithQualityLevelCalc = {
  subsection: SubsectionWithPosition & {
    subsubsections: {
      id: number
      lengthKm: number
      qualityLevel: { id: number; slug: string } | null
    }[]
  } & { sumLengthKmSubsubsections: number }
  qualityLevelsWithCount: { slug: string; sumOfLengthKm: number; sumOfLengthKmPercentage: number }[]
  sumLengthKmSubsubsectionsWithStandard: number
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
          select: { lengthKm: true, id: true, qualityLevel: true },
          orderBy: { slug: "asc" as Prisma.SortOrder },
        },
      },
    }

    const newSubsection = await db.subsection.findFirst(query)

    const qualityLevels = await db.qualityLevel.findMany({
      where: {
        project: {
          slug: projectSlug,
        },
      },
    })

    if (!newSubsection) throw new NotFoundError()

    const sumLengthKmSubsubsections = Number(
      newSubsection?.subsubsections.reduce((acc, s) => acc + (s.lengthKm ?? 0), 0).toFixed(3),
    )

    const subsubsectionsWithStandard = newSubsection?.subsubsections.filter((s) => s.qualityLevel)

    const sumLengthKmSubsubsectionsWithStandard = Number(
      subsubsectionsWithStandard.reduce((acc, s) => acc + (s.lengthKm ?? 0), 0).toFixed(3),
    )

    const qualityLevelsWithCount = qualityLevels.map((ql) => {
      return {
        slug: ql.slug,
        sumOfLengthKm: subsubsectionsWithStandard
          .filter((s) => s.qualityLevel?.id === ql.id)
          .reduce((acc, s) => acc + (s.lengthKm ?? 0), 0),
        sumOfLengthKmPercentage:
          (subsubsectionsWithStandard
            .filter((s) => s.qualityLevel?.id === ql.id)
            .reduce((acc, s) => acc + (s.lengthKm ?? 0), 0) /
            sumLengthKmSubsubsectionsWithStandard) *
          100,
      }
    })

    return {
      subsection: { ...newSubsection, sumLengthKmSubsubsections },
      qualityLevelsWithCount,
      sumLengthKmSubsubsectionsWithStandard,
    } as SubsectionWithSubsubsectionsWithPositionWithQualityLevelCalc
  },
)
