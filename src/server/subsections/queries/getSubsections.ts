import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import { SubsectionWithPosition } from "./getSubsection"

type GetSubsectionsInput = { projectSlug: string } & Pick<
  Prisma.SubsectionFindManyArgs,
  // Do not allow `include` or `select` here, since we overwrite the types below.
  "where" | "orderBy" | "skip" | "take"
>
export type SubsectionWithPositionAndStatus = SubsectionWithPosition & {
  SubsectionStatus: {
    id: number
    slug: string
    title: string
    style: string
  } | null
}
export default resolver.pipe(
  // @ts-expect-errors
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({
    projectSlug,
    where,
    orderBy = { order: "asc" },
    skip = 0,
    take = 500,
  }: GetSubsectionsInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: subsections,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      maxTake: 501,
      count: () => db.subsection.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.subsection.findMany({
          ...paginateArgs,
          where: safeWhere,
          orderBy,
          include: {
            operator: { select: { id: true, slug: true, title: true } },
            stakeholdernotes: { select: { id: true, status: true } },
            subsubsections: { select: { id: true } },
            SubsectionStatus: true,
          },
        }),
    })

    const subsectionsWithCounts: SubsectionWithPositionAndStatus[] = []

    subsections.forEach((subsection) => {
      const relevantStakeholdernotes = subsection.stakeholdernotes.filter(
        (note) => note.status !== "IRRELEVANT",
      ).length

      const doneStakeholdernotes = subsection.stakeholdernotes.filter(
        (note) => note.status === "DONE",
      ).length

      const subsubsectionCount = subsection.subsubsections.length

      // We only needed those for the counts, we don't actually want the full list to be returned
      // @ts-expect-error "The operand of a 'delete' operator must be optional.ts(2790)" is true but not relevant here
      delete subsection.stakeholdernotes
      // @ts-expect-error "The operand of a 'delete' operator must be optional.ts(2790)" is true but not relevant here
      delete subsection.subsubsections

      subsectionsWithCounts.push({
        ...subsection,
        geometry: subsection.geometry as [number, number][],
        stakeholdernotesCounts: { relevant: relevantStakeholdernotes, done: doneStakeholdernotes },
        subsubsectionCount,
      })
    })

    return {
      subsections: subsectionsWithCounts,
      nextPage,
      hasMore,
      count,
    }
  },
)
