import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import db from "db"

import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"

const Schema = z.object({
  projectSlug: z.string(),
})

export default resolver.pipe(
  resolver.zod(Schema),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug }) =>
    await db.user.findMany({
      where: { Membership: { some: { project: { slug: projectSlug } } } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    }),
)
