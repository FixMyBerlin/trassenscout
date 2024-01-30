import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"

import { GetSubsectionSchema, SubsectionWithPosition } from "./getSubsection"
import { SubsubsectionWithPositionWithSpecialFeatures } from "src/subsubsections/schema"

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
  authorizeProjectAdmin(getProjectIdBySlug),
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
