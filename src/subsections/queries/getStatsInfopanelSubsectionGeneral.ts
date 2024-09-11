import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { CurrentUser } from "src/users/types"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"
import { GetSubsectionSchema } from "./getSubsection"

export type SubsectionWithManagerOperatorOrder = {
  order: number
  manager: CurrentUser | null
  operator: { title: string } | null
  description: string | null
}

export default resolver.pipe(
  resolver.zod(GetSubsectionSchema),
  authorizeProjectAdmin(extractProjectSlug, viewerRoles),
  async ({ projectSlug, subsectionSlug }) => {
    const query = {
      where: {
        slug: subsectionSlug,
        project: {
          slug: projectSlug,
        },
      },
      select: {
        order: true,
        manager: true,
        operator: { select: { title: true } },
        description: true,
      },
    }

    const subsection = await db.subsection.findFirst(query)

    if (!subsection) throw new NotFoundError()
    return subsection as SubsectionWithManagerOperatorOrder
  },
)
