import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import getQualityLevelProjectId from "./getSubsubsectionSpecialProjectId"
import { viewerRoles } from "../../authorization/constants"

const GetSubsubsectionSpecial = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetSubsubsectionSpecial),
  authorizeProjectAdmin(getQualityLevelProjectId, viewerRoles),
  async ({ id }) => {
    return await db.subsubsectionSpecial.findFirstOrThrow({
      where: { id },
    })
  },
)
