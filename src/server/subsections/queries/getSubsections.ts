import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { typeSubsectionGeometry } from "@/src/server/subsections/utils/typeSubsectionGeometry"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import { TGetSubsection } from "./getSubsection"
import getSubsections from "./getSubsections"

type GetSubsectionsInput = { projectSlug: string } & Pick<
  Prisma.SubsectionFindManyArgs,
  // Do not allow `include` or `select` here, since we overwrite the types below.
  "where" | "orderBy" | "skip" | "take"
>
export type TGetSubsections = Awaited<ReturnType<typeof getSubsections>>
export type TSubsections = TGetSubsections["subsections"]

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
            SubsectionStatus: { select: { slug: true, title: true, style: true } },
          },
        }),
    })

    const subsectionsWithCounts: TGetSubsection[] = []

    subsections.forEach((subsection) => {
      const relevantStakeholdernotes = subsection.stakeholdernotes.filter(
        (note) => note.status !== "IRRELEVANT",
      ).length

      const doneStakeholdernotes = subsection.stakeholdernotes.filter(
        (note) => note.status === "DONE",
      ).length

      const subsubsectionCount = subsection.subsubsections.length
      const {
        stakeholdernotes: _delete1,
        subsubsections: _delete2,
        ...typedSubsection
      } = typeSubsectionGeometry(subsection)

      const subsectionWithCounts = {
        ...typedSubsection,
        type: subsection.type,
        stakeholdernotesCounts: { relevant: relevantStakeholdernotes, done: doneStakeholdernotes },
        subsubsectionCount,
      }
      subsectionsWithCounts.push(subsectionWithCounts)
    })

    return {
      subsections: subsectionsWithCounts,
      nextPage,
      hasMore,
      count,
    }
  },
)
