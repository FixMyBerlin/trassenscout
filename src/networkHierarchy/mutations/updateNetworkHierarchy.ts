import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import getQualityLevelProjectId from "../queries/getNetworkHierarchyProjectId"
import { NetworkHierarchySchema } from "../schema"

const UpdateNetworkHierarchySchema = NetworkHierarchySchema.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateNetworkHierarchySchema),
  authorizeProjectAdmin(getQualityLevelProjectId),
  async ({ id, ...data }) =>
    await db.networkHierarchy.update({
      where: { id },
      data,
    }),
)
