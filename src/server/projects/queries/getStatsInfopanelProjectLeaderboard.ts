import db, { Subsubsection } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { GetSubsectionsSchema } from "./getStatsInfopanelProjectCosts"

type SpecialsOperatorsManagersCount = {
  subsubsectionSpecialsWithCount: {
    id: number
    title: string
    count: number
  }[]
  operatorsWithCount: {
    id: number
    title: string
    count: number
    lengthKm: number
  }[]
  managersWithCount: Record<string, number>
}

export default resolver.pipe(
  resolver.zod(GetSubsectionsSchema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug }) => {
    const query = {
      where: {
        project: {
          slug: projectSlug,
        },
      },
      include: {
        networkHierarchy: { select: { title: true } },
        subsubsections: { include: { specialFeatures: true } },
        manager: true,
      },
    }

    const subsections = await db.subsection.findMany(query)

    const subsubsectionSpecials = await db.subsubsectionSpecial.findMany({
      where: {
        project: {
          slug: projectSlug,
        },
      },
      select: { id: true, title: true },
    })

    if (!subsections) throw new NotFoundError()

    // special features / Besonderheiten
    let subsubsectionsWithSpecials: Subsubsection[] = []
    subsections.forEach((sub) => {
      const filteredSub = sub.subsubsections.filter((subsub) => subsub.specialFeatures.length)
      subsubsectionsWithSpecials.push(...filteredSub)
    })

    const subsubsectionSpecialsWithCount = subsubsectionSpecials.map((special) => {
      return {
        ...special,
        count: subsubsectionsWithSpecials.filter((subsubsection) =>
          // @ts-expect-error
          subsubsection.specialFeatures.some((specialFeature) => specialFeature.id === special.id),
        ).length,
      }
    })

    // operators / BLT
    const operators = await db.operator.findMany({
      where: {
        project: {
          slug: projectSlug,
        },
      },
    })

    const operatorsWithCount = operators.map((operator) => {
      const subsectionWithOperator = subsections.filter(
        (subsubsection) => subsubsection.operatorId === operator.id,
      )
      return {
        ...operator,
        count: subsectionWithOperator.length,
        lengthKm: subsectionWithOperator.reduce((acc, sub) => acc + sub.lengthKm, 0),
      }
    })

    // PL / manager
    let managersWithCount = subsections.reduce((count, sub) => {
      if (sub.manager) {
        let id: string = sub.manager.email
        // @ts-expect-error
        count[id] = (count[id] || 0) + 1
      }
      return count
    }, {})

    return {
      subsubsectionSpecialsWithCount,
      operatorsWithCount,
      managersWithCount,
    } as SpecialsOperatorsManagersCount
  },
)
