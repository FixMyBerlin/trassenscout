import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"
import { SubsectionWithPosition } from "./getSubsection"

type GetSubsectionsInput = { projectSlug: string } & Pick<
  Prisma.SubsectionFindManyArgs,
  // Do not allow `include` or `select` here, since we overwrite the types below.
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({
    projectSlug,
    where,
    orderBy = { order: "asc" },
    skip = 0,
    take = 100,
  }: GetSubsectionsInput) => {
    const saveWhere = { project: { slug: projectSlug }, ...where }
    const {
      items: subsections,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.subsection.count({ where: saveWhere }),
      query: (paginateArgs) =>
        db.subsection.findMany({
          ...paginateArgs,
          where: saveWhere,
          orderBy,
          include: {
            operator: { select: { id: true, slug: true, title: true } },
            stakeholdernotes: { select: { id: true, status: true } },
            subsubsections: { select: { id: true } },
          },
        }),
    })

    const subsectionsWithCounts: SubsectionWithPosition[] = []

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
