import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"

const Schema = ProjectSlugRequiredSchema

export default resolver.pipe(
  resolver.zod(Schema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug }) => {
    const operators = await db.operator.findMany({
      where: { project: { slug: projectSlug } },
    })
    return operators
  },
)
