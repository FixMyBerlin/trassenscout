import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization/authorizeProjectAdmin"
import { editorRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { UpdateMembershipRole } from "../../auth/validations"

export default resolver.pipe(
  resolver.zod(UpdateMembershipRole),
  authorizeProjectAdmin(extractProjectSlug, editorRoles),
  async ({ membershipId, ...data }) => {
    const updated = await db.membership.update({ where: { id: membershipId }, data })

    // Delete the session of the updated user so she is forced to log in again to update her membership
    await db.session.deleteMany({ where: { userId: updated.userId } })

    return updated
  },
)
