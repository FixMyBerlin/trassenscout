import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"
import { GetSubsectionSchema, SubsectionWithPosition } from "./getSubsection"

type SubsectionCategory = {
  Anzahl: number
  "Summe km": number
}

type SububsectionsCategoryCount = {
  "RF (kein Bestand)": SubsectionCategory
  "RF (Bestand)": SubsectionCategory
  SF: SubsectionCategory
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
        "Summe km": Number(
          newSubsection?.subsubsections
            .filter((s) => s.type === "ROUTE" && !s.isExistingInfra)
            .reduce((acc, s) => acc + (s.lengthKm ?? 0), 0)
            .toFixed(3),
        ),
      },
      "RF (Bestand)": {
        Anzahl: newSubsection?.subsubsections.filter((s) => s.type === "ROUTE" && s.isExistingInfra)
          .length,
        "Summe km": Number(
          newSubsection?.subsubsections
            .filter((s) => s.type === "ROUTE" && s.isExistingInfra)
            .reduce((acc, s) => acc + (s.lengthKm ?? 0), 0)
            .toFixed(3),
        ),
      },
      SF: {
        Anzahl: newSubsection?.subsubsections.filter((s) => s.type === "AREA").length,
        "Summe km": Number(
          newSubsection?.subsubsections
            .filter((s) => s.type === "AREA")
            .reduce((acc, s) => acc + (s.lengthKm ?? 0), 0)
            .toFixed(3),
        ),
      },
    }
    // @ts-expect-error // todo
    return {
      subsection: {
        ...newSubsection,
        sumLengthKmSubsubsections: newSubsection?.subsubsections
          .reduce((acc, s) => acc + (s.lengthKm ?? 0), 0)
          .toFixed(3),
      },
      subsubsectionsCategoryCount,
    } as SubsectionWithSubsubsectionsWithSpecialFeaturesCount
  },
)
