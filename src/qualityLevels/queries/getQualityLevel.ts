import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import getQualityLevelProjectId from "./getQualityLevelProjectId"

const GetQualityLevelSchema = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetQualityLevelSchema),
  authorizeProjectAdmin(getQualityLevelProjectId),
  async ({ id }) => {
    return await db.qualityLevel.findFirstOrThrow({
      where: { id },
    })
  },
)
