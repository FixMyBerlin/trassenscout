import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"

type GetFilesInput = { projectSlug: string } & Pick<
  Prisma.FileFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, where, orderBy, skip = 0, take = 100 }: GetFilesInput) => {
    const saveWhere = { project: { slug: projectSlug }, ...where }
    const {
      items: files,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.file.count({ where: saveWhere }),
      query: (paginateArgs) => db.file.findMany({ ...paginateArgs, where: saveWhere, orderBy }),
    })

    return {
      files,
      nextPage,
      hasMore,
      count,
    }
  }
)
