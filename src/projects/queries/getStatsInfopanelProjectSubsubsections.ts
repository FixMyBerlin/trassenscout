import db, { Prisma, Subsubsection } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { viewerRoles } from "../../authorization/constants"
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
  qualityLevelsWithCount: {
    slug: string
    count: number
    lengthKm: number
    percentage: number
  }[]
}

const Schema = ProjectSlugRequiredSchema.merge(GetProject)

export default resolver.pipe(
  resolver.zod(Schema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug }) => {
    const query = {
      where: {
        slug: projectSlug,
      },
      include: {
        subsections: {
          include: {
            subsubsections: {
              orderBy: { slug: "asc" as Prisma.SortOrder },
              include: { qualityLevel: true },
            },
          },
        },
      },
    }

    const newProject = await db.project.findFirst(query)

    if (!newProject) throw new NotFoundError()

    const qualityLevels = await db.qualityLevel.findMany({
      where: {
        project: {
          slug: projectSlug,
        },
      },
    })

    const subsubsectionsNotIsExistingInfraAndRoute = []

    for (const subsection of newProject.subsections) {
      for (const subsubsection of subsection.subsubsections) {
        if (subsubsection.type === "ROUTE" && !subsubsection.isExistingInfra) {
          subsubsectionsNotIsExistingInfraAndRoute.push(subsubsection)
        }
      }
    }

    const subsubsectionsIsExistingInfraAndRoute = []

    for (const subsection of newProject.subsections) {
      for (const subsubsection of subsection.subsubsections) {
        if (subsubsection.type === "ROUTE" && subsubsection.isExistingInfra) {
          subsubsectionsIsExistingInfraAndRoute.push(subsubsection)
        }
      }
    }

    const subsubsectionsArea = []

    for (const subsection of newProject.subsections) {
      for (const subsubsection of subsection.subsubsections) {
        if (subsubsection.type === "AREA") {
          subsubsectionsArea.push(subsubsection)
        }
      }
    }

    let subsubsectionsSumLengthKm = 0

    for (const subsection of newProject.subsections) {
      subsubsectionsSumLengthKm += subsection.subsubsections.reduce(
        (acc, s) => acc + (s.lengthKm ?? 0),
        0,
      )
    }

    const subsubsectionsCategoryCount = {
      "RF (kein Bestand)": {
        Anzahl: subsubsectionsNotIsExistingInfraAndRoute.length, // Summe aller subsubsections aller Subasections des Projects mit type === "ROUTE" && !isExistingInfra
        Summe: subsubsectionsNotIsExistingInfraAndRoute.reduce(
          (acc, s) => acc + (s.lengthKm ?? 0),
          0,
        ),
      },
      "RF (Bestand)": {
        Anzahl: subsubsectionsIsExistingInfraAndRoute.length, // Summe aller subsubsections aller Subasections des Projects mit type === "ROUTE" && !isExistingInfra
        Summe: subsubsectionsIsExistingInfraAndRoute.reduce((acc, s) => acc + (s.lengthKm ?? 0), 0),
      },
      SF: {
        Anzahl: subsubsectionsArea.length, // Summe aller subsubsections aller Subasections des Projects mit type === "ROUTE" && !isExistingInfra
        Summe: subsubsectionsArea.reduce((acc, s) => acc + (s.lengthKm ?? 0), 0),
      },
    }

    // all subsubsections / Planungsabschnitte mit qulaity level / Ausbaustandard
    const subsubsectionsWithQualityLevel: Subsubsection[] = []

    newProject.subsections.forEach((newSubsection) => {
      const newSubsubsectionsWithQualityLevel = newSubsection?.subsubsections.filter(
        (subsubsection) => subsubsection?.qualityLevelId,
      )
      if (newSubsubsectionsWithQualityLevel.length)
        subsubsectionsWithQualityLevel.push(...newSubsubsectionsWithQualityLevel)
    })

    const subsubsectionsWithQualityLevelLengthKm = subsubsectionsWithQualityLevel.reduce(
      (acc, a) => acc + (a?.lengthKm || 0),
      0,
    )

    const qualityLevelsWithCount = qualityLevels.map((level) => {
      const subsubsectionsWithCertainQualityLevelLengthKm: number = subsubsectionsWithQualityLevel
        .filter((subsub) => subsub.qualityLevelId === level.id)
        .reduce((acc, a) => acc + (a?.lengthKm || 0), 0)
      return {
        slug: level.slug,
        count: subsubsectionsWithQualityLevel.filter((subsub) => subsub.qualityLevelId === level.id)
          .length,
        lengthKm: subsubsectionsWithCertainQualityLevelLengthKm,
        percentage:
          subsubsectionsWithCertainQualityLevelLengthKm /
          (subsubsectionsWithQualityLevelLengthKm / 100),
      }
    })

    return {
      project: {
        projectLengthKm: Number(
          newProject.subsections.reduce((acc, s) => acc + (s.lengthKm ?? 0), 0),
        ), // reduce length of all subsections of the project
        sumLengthKmSubsubsections: subsubsectionsSumLengthKm, // reduce length of all subsubsections of all subsections of the project
      },
      subsubsectionsCategoryCount,
      qualityLevelsWithCount,
    } as SubsectionWithSubsubsectionsWithSpecialFeaturesCount
  },
)
