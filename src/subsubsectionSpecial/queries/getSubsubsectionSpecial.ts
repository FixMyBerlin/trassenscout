import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import { viewerRoles } from "../../authorization/constants"
import getQualityLevelProjectId from "./getSubsubsectionSpecialProjectId"

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
