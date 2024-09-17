import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization/authorizeProjectAdmin"
import { editorRoles } from "src/authorization/constants"
import { extractProjectSlug } from "src/authorization/extractProjectSlug"
import { z } from "zod"

const DeleteMembership = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteMembership),
  authorizeProjectAdmin(extractProjectSlug, editorRoles),
  async ({ id }) => {
    return await db.membership.deleteMany({ where: { id } })
  },
)
