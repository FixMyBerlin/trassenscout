import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization/authorizeProjectAdmin"
import { editorRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const DeleteMembership = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteMembership),
  authorizeProjectAdmin(extractProjectSlug, editorRoles),
  async ({ id }) => {
    // Delete the session of the updated user so she is forced to log in again to update her membership
    const { userId } = await db.membership.findFirstOrThrow({
      where: { id },
      select: { userId: true },
    })
    await db.session.deleteMany({ where: { userId } })

    return await db.membership.deleteMany({ where: { id } })
  },
)
