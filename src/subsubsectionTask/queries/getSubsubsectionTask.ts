import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import getQualityLevelProjectId from "./getSubsubsectionTaskProjectId"

const GetSubsubsectionTask = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetSubsubsectionTask),
  authorizeProjectAdmin(getQualityLevelProjectId),
  async ({ id }) => {
    return await db.subsubsectionTask.findFirstOrThrow({
      where: { id },
    })
  },
)
