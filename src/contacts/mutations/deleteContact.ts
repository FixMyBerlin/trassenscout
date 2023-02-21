import { resolver } from "@blitzjs/rpc"
import db from "db"

import { z } from "zod"
import { authorizeProjectAdmin } from "src/authorization"

const DeleteContact = z.object({
  id: z.number(),
  projectSlug: z.string(),
})

export default resolver.pipe(resolver.zod(DeleteContact), authorizeProjectAdmin, async ({ id }) => {
  return await db.contact.deleteMany({ where: { id } })
})
