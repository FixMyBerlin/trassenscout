import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization/authorizeProjectAdmin"
import { editorRoles } from "src/authorization/constants"
import { extractProjectSlug } from "src/authorization/extractProjectSlug"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"
import { UpdateMembershipRole } from "../../auth/validations"

export default resolver.pipe(
  resolver.zod(UpdateMembershipRole),
  authorizeProjectAdmin(extractProjectSlug, editorRoles),
  async ({ projectSlug, userId, ...data }) => {
    const projectId = await getProjectIdBySlug(projectSlug)
    return await db.membership.update({ where: { projectId_userId: { projectId, userId } }, data })
  },
)
