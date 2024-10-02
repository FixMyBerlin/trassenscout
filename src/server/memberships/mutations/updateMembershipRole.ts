import db, { MembershipRoleEnum } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

export const UpdateMembershipSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    membershipId: z.number(),
    role: z.nativeEnum(MembershipRoleEnum),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateMembershipSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ membershipId, projectSlug, ...data }) => {
    const updated = await db.membership.update({ where: { id: membershipId }, data })

    // Delete the session of the updated user so she is forced to log in again to update her membership
    await db.session.deleteMany({ where: { userId: updated.userId } })

    return updated
  },
)
