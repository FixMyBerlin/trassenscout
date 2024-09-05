import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
import getContactProjectId from "./getContactProjectId"
import { viewerRoles } from "../../authorization/constants"

const GetContactSchema = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetContactSchema),
  authorizeProjectAdmin(getContactProjectId, viewerRoles),
  async ({ id }) => await db.contact.findFirstOrThrow({ where: { id } }),
)
