import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { DealAreaStatus } from "../schema"

const UpdateDealAreaStatusSchema = ProjectSlugRequiredSchema.merge(
  DealAreaStatus.merge(z.object({ id: z.number() })),
)

export default resolver.pipe(
  resolver.zod(UpdateDealAreaStatusSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug, ...data }) => {
    return await db.dealAreaStatus.update({
      where: { id },
      data,
    })
  },
)
