import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import getNetworkHierarchyProjectId from "./getNetworkHierarchyProjectId"
import { viewerRoles } from "../../authorization/constants"

const GetNetworkHierarchySchema = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetNetworkHierarchySchema),
  authorizeProjectAdmin(getNetworkHierarchyProjectId, viewerRoles),
  async ({ id }) => {
    return await db.networkHierarchy.findFirstOrThrow({
      where: { id },
    })
  },
)
