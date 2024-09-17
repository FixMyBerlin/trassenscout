import db, { Prisma } from "@/db"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"

type GetSurveyResponseTopicsInput = { projectSlug: string } & Pick<
  Prisma.SurveyResponseTopicFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  async ({
    projectSlug,
    where,
    orderBy = { id: "asc" },
    skip = 0,
    take = 100,
  }: GetSurveyResponseTopicsInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: surveyResponseTopics,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.surveyResponseTopic.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.surveyResponseTopic.findMany({
          ...paginateArgs,
          where: safeWhere,
          orderBy,
        }),
    })

    return {
      surveyResponseTopics,
      nextPage,
      hasMore,
      count,
    }
  },
)
