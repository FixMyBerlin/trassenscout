import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import getNetworkHierarchyProjectId from "../queries/getNetworkHierarchyProjectId"

const DeleteNetworkHierarchySchema = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteNetworkHierarchySchema),
  authorizeProjectAdmin(getNetworkHierarchyProjectId),
  async ({ id }) => await db.networkHierarchy.deleteMany({ where: { id } }),
)
