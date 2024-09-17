import db, { Subsection, Subsubsection } from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"
import { GetSubsectionSchema } from "./getSubsection"

type CostStructureCategory = {
  numberSubsubs: number | undefined
  costs?: number
  sumLengthKm: number
}

type CostStructure = {
  RF: CostStructureCategory
  SF: CostStructureCategory
  BRF: CostStructureCategory
}

type SubsectionWithAccCosts = Subsection & {
  subsubsections: Subsubsection[]
  accCosts: number
  subsubsectionsWithCostsLength: number
  subsubsectionsWithCostsLengthKm: number
}

type SubsectionWithCostStructure = {
  subsection: SubsectionWithAccCosts
  costStructure: CostStructure
}

export default resolver.pipe(
  resolver.zod(GetSubsectionSchema),
  authorizeProjectAdmin(extractProjectSlug, viewerRoles),
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
          select: {
            costEstimate: true,
            id: true,
            lengthKm: true,
            type: true,
            isExistingInfra: true,
          },
        },
      },
    }

    const newSubsection = await db.subsection.findFirst(query)

    // filter subsubsections with costs
    const subsubsectionsWithCosts = newSubsection?.subsubsections.filter(
      (subsubsection) => subsubsection?.costEstimate,
    )
    // filter brf ("Bestandsregelführung") (existing infra and line / ROUTE geometry type)
    const brf = newSubsection?.subsubsections?.filter(
      (sub) => sub.type === "ROUTE" && sub.isExistingInfra,
    )

    // sum of costs of subsubsections with costs
    const subsubsectionsWithCostsAccCosts = subsubsectionsWithCosts?.reduce(
      (acc, a) => acc + (a?.costEstimate || 0),
      0,
    )
    // sum of km of subsubsections with costs plus km of brf (existing infra, because they don't cost anything)
    const subsubsectionsWithCostsLengthKm =
      subsubsectionsWithCosts?.reduce((acc, a) => acc + (a?.lengthKm || 0), 0) ||
      0 + (brf?.reduce((acc, a) => acc + (a?.lengthKm || 0), 0) || 0)

    // RF with costs
    const rfWithCosts = newSubsection?.subsubsections?.filter(
      (sub) => sub.type === "ROUTE" && sub.costEstimate && !sub.isExistingInfra,
    )
    // SF with costs
    const sfWithCosts = newSubsection?.subsubsections?.filter(
      (sub) => sub.type === "AREA" && sub.costEstimate && !sub.isExistingInfra,
    )

    const costStructure = {
      RF: {
        numberSubsubs: rfWithCosts?.length,
        costs: rfWithCosts?.reduce((acc, a) => acc + (a?.costEstimate || 0), 0),
        sumLengthKm: rfWithCosts?.reduce((acc, a) => acc + (a?.lengthKm || 0), 0),
      },
      SF: {
        numberSubsubs: sfWithCosts?.length,
        costs: sfWithCosts?.reduce((acc, a) => acc + (a?.costEstimate || 0), 0),
        sumLengthKm: sfWithCosts?.reduce((acc, a) => acc + (a?.lengthKm || 0), 0),
      },
      BRF: {
        numberSubsubs: brf?.length,
        costs: undefined,
        sumLengthKm: brf?.reduce((acc, a) => acc + (a?.lengthKm || 0), 0),
      },
    }

    const subsection = {
      ...newSubsection,
      subsubsectionsWithCostsLength: subsubsectionsWithCosts?.length,
      accCosts: subsubsectionsWithCostsAccCosts,
      subsubsectionsWithCostsLengthKm,
    }

    if (!subsection) throw new NotFoundError()
    return { subsection, costStructure } as SubsectionWithCostStructure
  },
)
