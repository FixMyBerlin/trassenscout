import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"
import { viewerRoles } from "../../authorization/constants"

type GetSurveysInput = { projectSlug: string } & Pick<
  Prisma.SurveyFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(extractProjectSlug, viewerRoles),
  async ({
    projectSlug,
    where,
    orderBy = { id: "asc" },
    skip = 0,
    take = 100,
  }: GetSurveysInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: surveys,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.survey.count({ where: safeWhere }),
      query: (paginateArgs) => db.survey.findMany({ ...paginateArgs, where: safeWhere, orderBy }),
    })

    return {
      surveys,
      nextPage,
      hasMore,
      count,
    }
  },
)
