import db from "db"
import { resolver } from "@blitzjs/rpc"

import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"
import { viewerRoles } from "../../authorization/constants"

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
