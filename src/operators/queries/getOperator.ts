import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { viewerRoles } from "../../authorization/constants"
import getOperatorProjectId from "./getOperatorProjectId"

const GetOperatorSchema = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetOperatorSchema),
  authorizeProjectAdmin(getOperatorProjectId, viewerRoles),
  async ({ id }) => {
    return await db.operator.findFirstOrThrow({
      where: { id },
    })
  },
)
