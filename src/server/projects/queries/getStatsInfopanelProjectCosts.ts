import db, { Subsubsection } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"

const Schema = ProjectSlugRequiredSchema

type CostStructureCategory = {
  numberSubsubs: number | undefined
  costs?: number
  sumLengthM: number
}

type CostStructure = {
  "RF (kein Bestand)": CostStructureCategory
  SF: CostStructureCategory
  "RF (Bestand)": CostStructureCategory
}

type ProjectSubsectionsWithCostStructure = {
  accCosts: number
  projectLengthM: number
  costStructure: CostStructure
  subsubsectionsWithCostsLengthM: number
}

export default resolver.pipe(
  resolver.zod(Schema),
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
            lengthM: true,
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
      "costEstimate" | "id" | "lengthM" | "type" | "isExistingInfra"
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
    const subsubsectionsWithCostsLengthM = subsubsectionsWithCosts?.reduce(
      (acc, a) => acc + (a?.lengthM || 0),
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
        sumLengthM: rfWithCosts?.reduce((acc, a) => acc + (a?.lengthM || 0), 0),
      },
      SF: {
        numberSubsubs: sfWithCosts?.length,
        costs: sfWithCosts?.reduce((acc, a) => acc + (a?.costEstimate || 0), 0),
        sumLengthM: sfWithCosts?.reduce((acc, a) => acc + (a?.lengthM || 0), 0),
      },
      "RF (Bestand)": {
        numberSubsubs: brf?.length,
        costs: undefined,
        sumLengthM: brf?.reduce((acc, a) => acc + (a?.lengthM || 0), 0),
      },
    }

    return {
      accCosts: subsubsectionsWithCostsAccCosts,
      projectLengthM: newSubsections.reduce((acc, s) => acc + (s.lengthM ?? 0), 0),
      subsubsectionsWithCostsLengthM,
      costStructure,
    } as ProjectSubsectionsWithCostStructure
  },
)
