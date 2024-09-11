import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import { viewerRoles } from "../../authorization/constants"
import getQualityLevelProjectId from "./getSubsubsectionInfraProjectId"

const GetSubsubsectionInfra = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetSubsubsectionInfra),
  authorizeProjectAdmin(getQualityLevelProjectId, viewerRoles),
  async ({ id }) => {
    return await db.subsubsectionInfra.findFirstOrThrow({
      where: { id },
    })
  },
)
