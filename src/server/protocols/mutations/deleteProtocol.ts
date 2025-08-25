import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { DeleteProtocolSchema } from "@/src/server/protocols/schemas"
import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(
  resolver.zod(DeleteProtocolSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const protocol = await db.protocol.deleteMany({ where: { id } })

    return protocol
  },
)
