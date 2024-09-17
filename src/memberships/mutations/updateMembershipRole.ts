import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization/authorizeProjectAdmin"
import { editorRoles } from "src/authorization/constants"
import { extractProjectSlug } from "src/authorization/extractProjectSlug"
import { UpdateMembershipRole } from "../../auth/validations"

export default resolver.pipe(
  resolver.zod(UpdateMembershipRole),
  authorizeProjectAdmin(extractProjectSlug, editorRoles),
  async ({ membershipId, ...data }) => {
    return await db.membership.update({ where: { id: membershipId }, data })
  },
)
