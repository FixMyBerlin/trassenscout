import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { viewerRoles } from "../../authorization/constants"
import getQualityLevelProjectId from "./getQualityLevelProjectId"

const GetQualityLevelSchema = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetQualityLevelSchema),
  authorizeProjectAdmin(getQualityLevelProjectId, viewerRoles),
  async ({ id }) => {
    return await db.qualityLevel.findFirstOrThrow({
      where: { id },
    })
  },
)
