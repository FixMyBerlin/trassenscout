import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { viewerRoles } from "../../authorization/constants"
import getNetworkHierarchyProjectId from "./getNetworkHierarchyProjectId"

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
