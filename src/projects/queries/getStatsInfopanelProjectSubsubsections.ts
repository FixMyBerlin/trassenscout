import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"
import { GetProject } from "./getProject"

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
  project: {
    projectLengthKm: number
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
  resolver.zod(GetProject),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ slug }) => {
    const query = {
      where: {
        slug: slug,
      },
      include: {
        subsections: {
          include: {
            subsubsections: {
              select: { type: true, isExistingInfra: true, lengthKm: true, id: true },
              orderBy: { slug: "asc" as Prisma.SortOrder },
            },
          },
        },
      },
    }

    const newProject = await db.project.findFirst(query)

    if (!newProject) throw new NotFoundError()

    // console.log("newProject", newProject)

    const subsubsectionsNotIsExistingInfraAndRoute = []

    for (const subsection of newProject.subsections) {
      for (const subsubsection of subsection.subsubsections) {
        if (subsubsection.type === "ROUTE" && !subsubsection.isExistingInfra) {
          subsubsectionsNotIsExistingInfraAndRoute.push(subsubsection)
        }
      }
    }

    console.log({ subsubsectionsNotIsExistingInfraAndRoute })

    const subsubsectionsIsExistingInfraAndRoute = []

    for (const subsection of newProject.subsections) {
      for (const subsubsection of subsection.subsubsections) {
        if (subsubsection.type === "ROUTE" && subsubsection.isExistingInfra) {
          subsubsectionsIsExistingInfraAndRoute.push(subsubsection)
        }
      }
    }

    console.log({ subsubsectionsIsExistingInfraAndRoute })

    const subsubsectionsArea = []

    for (const subsection of newProject.subsections) {
      for (const subsubsection of subsection.subsubsections) {
        if (subsubsection.type === "AREA") {
          subsubsectionsArea.push(subsubsection)
        }
      }
    }

    console.log({ subsubsectionsArea })

    let subsubsectionsSumLengthKm = 0

    for (const subsection of newProject.subsections) {
      subsubsectionsSumLengthKm += subsection.subsubsections.reduce(
        (acc, s) => acc + (s.lengthKm ?? 0),
        0,
      )
    }

    console.log({ subsubsectionsSumLengthKm })

    const subsubsectionsCategoryCount = {
      "RF (kein Bestand)": {
        Anzahl: subsubsectionsNotIsExistingInfraAndRoute.length, // Summe aller subsubsections aller Subasections des Projects mit type === "ROUTE" && !isExistingInfra
        Summe: Number(
          subsubsectionsNotIsExistingInfraAndRoute
            .reduce((acc, s) => acc + (s.lengthKm ?? 0), 0)
            .toFixed(3),
        ),
      },
      "RF (Bestand)": {
        Anzahl: subsubsectionsIsExistingInfraAndRoute.length, // Summe aller subsubsections aller Subasections des Projects mit type === "ROUTE" && !isExistingInfra
        Summe: Number(
          subsubsectionsIsExistingInfraAndRoute
            .reduce((acc, s) => acc + (s.lengthKm ?? 0), 0)
            .toFixed(3),
        ),
      },
      SF: {
        Anzahl: subsubsectionsArea.length, // Summe aller subsubsections aller Subasections des Projects mit type === "ROUTE" && !isExistingInfra
        Summe: Number(subsubsectionsArea.reduce((acc, s) => acc + (s.lengthKm ?? 0), 0).toFixed(3)),
      },
    }

    return {
      project: {
        projectLengthKm: Number(
          newProject.subsections.reduce((acc, s) => acc + (s.lengthKm ?? 0), 0).toFixed(3),
        ), // reduce length of all subsections of the project
        sumLengthKmSubsubsections: subsubsectionsSumLengthKm, // reduce length of all subsubsections of all subsections of the project
      },
      subsubsectionsCategoryCount,
    } as SubsectionWithSubsubsectionsWithSpecialFeaturesCount
  },
)
