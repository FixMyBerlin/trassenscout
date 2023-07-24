import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import getContactProjectId from "./getContactProjectId"
import db from "db"

import { authorizeProjectAdmin } from "src/authorization"

const GetContactSchema = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetContactSchema),
  authorizeProjectAdmin(getContactProjectId),
  async ({ id }) => await db.contact.findFirstOrThrow({ where: { id } }),
)
