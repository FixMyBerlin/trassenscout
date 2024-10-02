import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const DeleteMembershipSchema = ProjectSlugRequiredSchema.merge(
  z.object({ membershipId: z.number() }),
)

export default resolver.pipe(
  resolver.zod(DeleteMembershipSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ membershipId }) => {
    // Delete the session of the updated user so she is forced to log in again to update her membership
    const { userId } = await db.membership.findFirstOrThrow({
      where: { id: membershipId },
      select: { userId: true },
    })
    await db.session.deleteMany({ where: { userId } })

    return await db.membership.deleteMany({ where: { id: membershipId } })
  },
)
