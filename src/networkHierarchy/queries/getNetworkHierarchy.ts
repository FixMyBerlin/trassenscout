import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { viewerRoles } from "../../authorization/constants"

const GetNetworkHierarchySchema = ProjectSlugRequiredSchema.merge(
  z.object({
    // This accepts type of undefined, but is required at runtime
    id: z.number().optional().refine(Boolean, "Required"),
  }),
)

export default resolver.pipe(
  resolver.zod(GetNetworkHierarchySchema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ id }) => {
    return await db.networkHierarchy.findFirstOrThrow({
      where: { id },
    })
  },
)
