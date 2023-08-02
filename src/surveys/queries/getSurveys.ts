import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"

type GetSurveysInput = { projectSlug: string } & Pick<
  Prisma.SurveyFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({
    projectSlug,
    where,
    orderBy = { id: "asc" },
    skip = 0,
    take = 100,
  }: GetSurveysInput) => {
    const saveWhere = { project: { slug: projectSlug }, ...where }
    const {
      items: surveys,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.survey.count({ where: saveWhere }),
      query: (paginateArgs) => db.survey.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      surveys,
      nextPage,
      hasMore,
      count,
    }
  },
)
