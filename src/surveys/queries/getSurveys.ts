import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"

type GetSurveysInput = { projectSlug: string } & Pick<
  Prisma.SurveyFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
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
