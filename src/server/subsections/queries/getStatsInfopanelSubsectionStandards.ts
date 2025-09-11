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
      lengthM: number
      qualityLevel: { id: number; slug: string } | null
    }[]
  } & { sumLengthMSubsubsections: number }
  qualityLevelsWithCount: { slug: string; sumOfLengthM: number; sumOfLengthMPercentage: number }[]
  sumLengthMSubsubsectionsWithStandard: number
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
          select: { lengthM: true, id: true, qualityLevel: true },
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

    const sumLengthMSubsubsections = Number(
      newSubsection?.subsubsections.reduce((acc, s) => acc + (s.lengthM ?? 0), 0).toFixed(3),
    )

    const subsubsectionsWithStandard = newSubsection?.subsubsections.filter((s) => s.qualityLevel)

    const sumLengthMSubsubsectionsWithStandard = Number(
      subsubsectionsWithStandard.reduce((acc, s) => acc + (s.lengthM ?? 0), 0).toFixed(3),
    )

    const qualityLevelsWithCount = qualityLevels.map((ql) => {
      return {
        slug: ql.slug,
        sumOfLengthM: subsubsectionsWithStandard
          .filter((s) => s.qualityLevel?.id === ql.id)
          .reduce((acc, s) => acc + (s.lengthM ?? 0), 0),
        sumOfLengthMPercentage:
          (subsubsectionsWithStandard
            .filter((s) => s.qualityLevel?.id === ql.id)
            .reduce((acc, s) => acc + (s.lengthM ?? 0), 0) /
            sumLengthMSubsubsectionsWithStandard) *
          100,
      }
    })

    return {
      subsection: { ...newSubsection, sumLengthMSubsubsections },
      qualityLevelsWithCount,
      sumLengthMSubsubsectionsWithStandard,
    } as SubsectionWithSubsubsectionsWithPositionWithQualityLevelCalc
  },
)
