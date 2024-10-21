import db, { Prisma } from "@/db"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"

type GetSurveySessionsInput = Pick<
  Prisma.SurveySessionFindManyArgs,
  "where" | "orderBy" | "skip" | "take" | "include"
>

export default resolver.pipe(
  resolver.authorize("ADMIN"),
  async ({
    where,
    orderBy = { id: "desc" },
    include,
    skip = 0,
    take = 100,
  }: GetSurveySessionsInput) => {
    const {
      items: surveySessions,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.surveySession.count({ where }),
      query: (paginateArgs) =>
        db.surveySession.findMany({
          ...paginateArgs,
          where,
          orderBy,
          include: { responses: true, ...include },
        }),
    })

    return {
      surveySessions,
      nextPage,
      hasMore,
      count,
    }
  },
)
