import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { GetSubsectionsSchema } from "./getStatsInfopanelProjectCosts"
import { extractSlug } from "../../authorization/extractSlug"
import { viewerRoles } from "../../authorization/constants"

type SubsubsectionWithEstimatedCompletionDate = {
  id: number
  estimatedCompletionDate: Date
  slug: string
}

type SubsubsectionsWithEstimatedCompetionDate = {
  subsubsectionsWithEstimatedCompletionDate: SubsubsectionWithEstimatedCompletionDate[]
}

export default resolver.pipe(
  resolver.zod(GetSubsectionsSchema),
  authorizeProjectAdmin(extractSlug, viewerRoles),
  async ({ projectSlug }) => {
    const query = {
      where: {
        project: {
          slug: projectSlug,
        },
      },
      include: {
        subsubsections: {
          select: { estimatedCompletionDate: true, slug: true, id: true },
          orderBy: { slug: "asc" as Prisma.SortOrder },
        },
      },
    }

    const subsections = await db.subsection.findMany(query)
    if (!subsections.length) throw new NotFoundError()

    const subsubsectionsWithEstimatedCompletionDate: SubsubsectionWithEstimatedCompletionDate[] = []
    subsections.forEach((sub) => {
      const filteredSubsubsection = sub.subsubsections.filter(
        (subsub) => subsub.estimatedCompletionDate,
      )
      // @ts-ignore we just filtered the subsubsection so we know for sure that estimatedCompletionDate exists / is of type Date
      subsubsectionsWithEstimatedCompletionDate.push(...filteredSubsubsection)
    })

    return {
      subsubsectionsWithEstimatedCompletionDate,
    } as SubsubsectionsWithEstimatedCompetionDate
  },
)
