import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { CurrentUser } from "@/src/server/users/types"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { GetSubsectionSchema } from "./getSubsection"

export type SubsectionWithManagerOperatorOrder = {
  order: number
  manager: CurrentUser | null
  operator: { title: string } | null
  description: string | null
}

export default resolver.pipe(
  resolver.zod(GetSubsectionSchema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
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
