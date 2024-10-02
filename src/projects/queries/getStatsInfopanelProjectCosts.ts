import db, { Subsubsection } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { z } from "zod"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"

export const GetSubsectionsSchema = z.object({
  projectSlug: z.string(),
})

type CostStructureCategory = {
  numberSubsubs: number | undefined
  costs?: number
  sumLengthKm: number
}

type CostStructure = {
  "RF (kein Bestand)": CostStructureCategory
  SF: CostStructureCategory
  "RF (Bestand)": CostStructureCategory
}

type ProjectSubsectionsWithCostStructure = {
  accCosts: number
  projectLengthKm: number
  costStructure: CostStructure
  subsubsectionsWithCostsLengthKm: number
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

    const newSubsections = await db.subsection.findMany(query)

    if (!newSubsections.length) throw new NotFoundError()

    const subsubsectionsWithCosts: Pick<
      Subsubsection,
      "costEstimate" | "id" | "lengthKm" | "type" | "isExistingInfra"
    >[] = []

    // filter all susbsubsections with costs OR BRF ("Bestandsregelführung")
    // (line geometry / ROUTE andisExistingInfra)
    // as BRF don't have costs anyway
    newSubsections.forEach((newSubsection) => {
      const newSubsubsectionsWithCosts = newSubsection?.subsubsections.filter(
        (subsubsection) =>
          subsubsection?.costEstimate ||
          (subsubsection.type === "ROUTE" && subsubsection.isExistingInfra),
      )
      if (newSubsubsectionsWithCosts.length)
        subsubsectionsWithCosts.push(...newSubsubsectionsWithCosts)
    })

    const subsubsectionsWithCostsAccCosts = subsubsectionsWithCosts?.reduce(
      (acc, a) => acc + (a?.costEstimate || 0),
      0,
    )
    const subsubsectionsWithCostsLengthKm = subsubsectionsWithCosts?.reduce(
      (acc, a) => acc + (a?.lengthKm || 0),
      0,
    )

    const rfWithCosts = subsubsectionsWithCosts?.filter(
      (subsub) => subsub.type === "ROUTE" && subsub.costEstimate && !subsub.isExistingInfra,
    )
    const sfWithCosts = subsubsectionsWithCosts?.filter(
      (subsub) => subsub.type === "AREA" && subsub.costEstimate && !subsub.isExistingInfra,
    )
    const brf = subsubsectionsWithCosts?.filter(
      (subsub) => subsub.type === "ROUTE" && subsub.isExistingInfra,
    )

    const costStructure = {
      "RF (kein Bestand)": {
        numberSubsubs: rfWithCosts?.length,
        costs: rfWithCosts?.reduce((acc, a) => acc + (a?.costEstimate || 0), 0),
        sumLengthKm: rfWithCosts?.reduce((acc, a) => acc + (a?.lengthKm || 0), 0),
      },
      SF: {
        numberSubsubs: sfWithCosts?.length,
        costs: sfWithCosts?.reduce((acc, a) => acc + (a?.costEstimate || 0), 0),
        sumLengthKm: sfWithCosts?.reduce((acc, a) => acc + (a?.lengthKm || 0), 0),
      },
      "RF (Bestand)": {
        numberSubsubs: brf?.length,
        costs: undefined,
        sumLengthKm: brf?.reduce((acc, a) => acc + (a?.lengthKm || 0), 0),
      },
    }

    return {
      accCosts: subsubsectionsWithCostsAccCosts,
      projectLengthKm: newSubsections.reduce((acc, s) => acc + (s.lengthKm ?? 0), 0),
      subsubsectionsWithCostsLengthKm,
      costStructure,
    } as ProjectSubsectionsWithCostStructure
  },
)
