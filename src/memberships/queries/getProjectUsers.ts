import db from "db"
import { resolver } from "@blitzjs/rpc"

import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"
import { z } from "zod"

const Schema = z.object({
  projectSlug: z.string(),
})

export default resolver.pipe(
  resolver.zod(Schema),
  authorizeProjectAdmin(getProjectIdBySlug),
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
