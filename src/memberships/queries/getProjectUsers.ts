import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"

const Schema = z.object({
  projectSlug: z.string(),
})

export default resolver.pipe(
  resolver.zod(Schema),
  authorizeProjectAdmin(extractProjectSlug, viewerRoles),
  async ({ projectSlug }) =>
    await db.user.findMany({
      where: { memberships: { some: { project: { slug: projectSlug } } } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    }),
)
