import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import getContactProjectId from "../queries/getContactProjectId"
import db from "db"

import { authorizeProjectAdmin } from "src/authorization"

const DeleteContactSchema = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteContactSchema),
  authorizeProjectAdmin(getContactProjectId),
  async ({ id }) => await db.contact.deleteMany({ where: { id } }),
)
