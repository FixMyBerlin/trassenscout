import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import { viewerRoles } from "../../authorization/constants"
import getContactProjectId from "./getContactProjectId"

const GetContactSchema = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetContactSchema),
  authorizeProjectAdmin(getContactProjectId, viewerRoles),
  async ({ id }) => await db.contact.findFirstOrThrow({ where: { id } }),
)
