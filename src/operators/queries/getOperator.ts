import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import getOperatorProjectId from "./getOperatorProjectId"

const GetOperatorSchema = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetOperatorSchema),
  authorizeProjectAdmin(getOperatorProjectId),
  async ({ id }) => {
    return await db.operator.findFirstOrThrow({
      where: { id },
    })
  },
)
