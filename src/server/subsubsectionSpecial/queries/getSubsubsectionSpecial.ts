import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const GetSubsubsectionSpecial = ProjectSlugRequiredSchema.merge(
  z.object({
    // This accepts type of undefined, but is required at runtime
    id: z.number().optional().refine(Boolean, "Required"),
  }),
)

export default resolver.pipe(
  resolver.zod(GetSubsubsectionSpecial),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ id }) => {
    return await db.subsubsectionSpecial.findFirstOrThrow({
      where: { id },
    })
  },
)
