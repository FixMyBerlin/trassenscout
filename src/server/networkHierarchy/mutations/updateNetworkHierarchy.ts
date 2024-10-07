import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { NetworkHierarchySchema } from "../schema"

const UpdateNetworkHierarchySchema = ProjectSlugRequiredSchema.merge(
  NetworkHierarchySchema.merge(z.object({ id: z.number() })),
)

export default resolver.pipe(
  resolver.zod(UpdateNetworkHierarchySchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug, ...data }) => {
    return await db.networkHierarchy.update({
      where: { id },
      data,
    })
  },
)
