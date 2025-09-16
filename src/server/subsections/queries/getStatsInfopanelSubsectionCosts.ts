import db, { Subsection, Subsubsection } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { GetSubsectionSchema } from "./getSubsection"

type CostStructureCategory = {
  numberSubsubs: number | undefined
  costs?: number
  sumLengthM: number
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
  subsubsectionsWithCostsLengthM: number
}

type SubsectionWithCostStructure = {
  subsection: SubsectionWithAccCosts
  costStructure: CostStructure
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
          select: {
            costEstimate: true,
            id: true,
            lengthM: true,
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
    // sum of m of subsubsections with costs plus m of brf (existing infra, because they don't cost anything)
    const subsubsectionsWithCostsLengthM =
      subsubsectionsWithCosts?.reduce((acc, a) => acc + (a?.lengthM || 0), 0) ||
      0 + (brf?.reduce((acc, a) => acc + (a?.lengthM || 0), 0) || 0)

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
        sumLengthM: rfWithCosts?.reduce((acc, a) => acc + (a?.lengthM || 0), 0),
      },
      SF: {
        numberSubsubs: sfWithCosts?.length,
        costs: sfWithCosts?.reduce((acc, a) => acc + (a?.costEstimate || 0), 0),
        sumLengthM: sfWithCosts?.reduce((acc, a) => acc + (a?.lengthM || 0), 0),
      },
      BRF: {
        numberSubsubs: brf?.length,
        costs: undefined,
        sumLengthM: brf?.reduce((acc, a) => acc + (a?.lengthM || 0), 0),
      },
    }

    const subsection = {
      ...newSubsection,
      subsubsectionsWithCostsLength: subsubsectionsWithCosts?.length,
      accCosts: subsubsectionsWithCostsAccCosts,
      subsubsectionsWithCostsLengthM,
    }

    if (!subsection) throw new NotFoundError()
    return { subsection, costStructure } as SubsectionWithCostStructure
  },
)
