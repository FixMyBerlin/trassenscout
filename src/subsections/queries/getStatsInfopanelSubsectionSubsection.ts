import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { SubsubsectionWithPositionWithSpecialFeatures } from "@/src/subsubsections/schema"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { GetSubsectionSchema, SubsectionWithPosition } from "./getSubsection"

type SubsectionWithSubsubsectionsWithSpecialFeaturesCount = {
  subsection: SubsectionWithPosition & {
    subsubsections: SubsubsectionWithPositionWithSpecialFeatures[]
    networkHierarchy: { title: string }
  }
  subsubsectionSpecialsWithCount: {
    id: number
    title: string
    count: number
  }[]
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
        networkHierarchy: { select: { title: true } },
        subsubsections: {
          include: {
            specialFeatures: { select: { id: true, title: true } },
          },
          orderBy: { slug: "asc" as Prisma.SortOrder },
        },
      },
    }

    const subsection = await db.subsection.findFirst(query)
    const subsubsectionSpecials = await db.subsubsectionSpecial.findMany({
      where: {
        project: {
          slug: projectSlug,
        },
      },
      select: { id: true, title: true },
    })

    if (!subsection) throw new NotFoundError()

    const subsubsectionSpecialsWithCount = subsubsectionSpecials.map((special) => {
      return {
        ...special,
        count: subsection.subsubsections.filter((subsubsection) =>
          subsubsection.specialFeatures.some((specialFeature) => specialFeature.id === special.id),
        ).length,
      }
    })

    return {
      subsection,
      subsubsectionSpecialsWithCount,
    } as SubsectionWithSubsubsectionsWithSpecialFeaturesCount
  },
)
