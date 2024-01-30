import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db, { Subsection, Subsubsection } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"
import { GetSubsectionSchema } from "./getSubsection"

type CostStructureCategory = {
  numberSubsubs: number | undefined
  costs?: number
  sumLengthKm: number | undefined
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

    const subsubsectionsWithCosts = newSubsection?.subsubsections.filter(
      (subsubsection) => subsubsection?.costEstimate,
    )

    const subsubsectionsWithCostsAccCosts = subsubsectionsWithCosts?.reduce(
      (acc, a) => acc + (a?.costEstimate || 0),
      0,
    )
    const subsubsectionsWithCostsLengthKm = subsubsectionsWithCosts?.reduce(
      (acc, a) => acc + (a?.lengthKm || 0),
      0,
    )

    const rfWithCosts = newSubsection?.subsubsections?.filter(
      (sub) => sub.type === "ROUTE" && sub.costEstimate && !sub.isExistingInfra,
    )
    const sfWithCosts = newSubsection?.subsubsections?.filter(
      (sub) => sub.type === "AREA" && sub.costEstimate && !sub.isExistingInfra,
    )
    const brfWithCosts = newSubsection?.subsubsections?.filter(
      (sub) => sub.type === "ROUTE" && sub.isExistingInfra,
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
        numberSubsubs: brfWithCosts?.length,
        costs: undefined,
        sumLengthKm: brfWithCosts?.reduce((acc, a) => acc + (a?.lengthKm || 0), 0),
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
