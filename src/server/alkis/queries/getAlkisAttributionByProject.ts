import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { alkisStateConfig } from "@/src/server/alkis/alkisStateConfig"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"

export default resolver.pipe(
  resolver.zod(ProjectSlugRequiredSchema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug }) => {
    const project = await db.project.findFirst({
      where: { slug: projectSlug },
      select: { alkisStateKey: true },
    })

    if (!project) throw new NotFoundError()

    const stateConfig = alkisStateConfig[project.alkisStateKey]
    if (stateConfig.enabled !== true) return null

    return stateConfig.attribution
  },
)
