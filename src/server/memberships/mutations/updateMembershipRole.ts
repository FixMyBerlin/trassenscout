import db, { MembershipRoleEnum } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { membershipUpdateSession } from "../_utils/membershipUpdateSession"

export const UpdateMembershipSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    membershipId: z.number(),
    role: z.nativeEnum(MembershipRoleEnum),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateMembershipSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ membershipId, projectSlug, ...data }, ctx) => {
    const updated = await db.membership.update({ where: { id: membershipId }, data })

    membershipUpdateSession(updated.userId, ctx.session)

    return updated
  },
)
