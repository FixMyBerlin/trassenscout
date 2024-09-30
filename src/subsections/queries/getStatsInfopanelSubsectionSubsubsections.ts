import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"
import { GetSubsectionSchema, SubsectionWithPosition } from "./getSubsection"

type SubsubsectionCategory = {
  Anzahl: number
  Summe: number
}

type SububsectionsCategoryCount = {
  "RF (kein Bestand)": SubsubsectionCategory
  "RF (Bestand)": SubsubsectionCategory
  SF: SubsubsectionCategory
}

type SubsectionWithSubsubsectionsWithSpecialFeaturesCount = {
  subsection: SubsectionWithPosition & {
    subsubsections: {
      id: number
      type: "ROUTE" | "AREA"
      isExistingInfra: boolean
      lengthKm: number
    }[]
  } & { sumLengthKmSubsubsections: number }
  subsubsectionsCategoryCount: SububsectionsCategoryCount
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
          select: { type: true, isExistingInfra: true, lengthKm: true, id: true },
          orderBy: { slug: "asc" as Prisma.SortOrder },
        },
      },
    }

    const newSubsection = await db.subsection.findFirst(query)

    if (!newSubsection) throw new NotFoundError()

    const subsubsectionsCategoryCount = {
      "RF (kein Bestand)": {
        Anzahl: newSubsection?.subsubsections.filter(
          (s) => s.type === "ROUTE" && !s.isExistingInfra,
        ).length,
        Summe: Number(
          newSubsection?.subsubsections
            .filter((s) => s.type === "ROUTE" && !s.isExistingInfra)
            .reduce((acc, s) => acc + (s.lengthKm ?? 0), 0)
            .toFixed(3),
        ),
      },
      "RF (Bestand)": {
        Anzahl: newSubsection?.subsubsections.filter((s) => s.type === "ROUTE" && s.isExistingInfra)
          .length,
        Summe: Number(
          newSubsection?.subsubsections
            .filter((s) => s.type === "ROUTE" && s.isExistingInfra)
            .reduce((acc, s) => acc + (s.lengthKm ?? 0), 0)
            .toFixed(3),
        ),
      },
      SF: {
        Anzahl: newSubsection?.subsubsections.filter((s) => s.type === "AREA").length,
        Summe: Number(
          newSubsection?.subsubsections
            .filter((s) => s.type === "AREA")
            .reduce((acc, s) => acc + (s.lengthKm ?? 0), 0)
            .toFixed(3),
        ),
      },
    }

    return {
      subsection: {
        ...newSubsection,
        sumLengthKmSubsubsections: Number(
          newSubsection?.subsubsections.reduce((acc, s) => acc + (s.lengthKm ?? 0), 0).toFixed(3),
        ),
      },
      subsubsectionsCategoryCount,
    } as SubsectionWithSubsubsectionsWithSpecialFeaturesCount
  },
)
