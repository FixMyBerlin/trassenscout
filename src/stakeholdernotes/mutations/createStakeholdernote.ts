import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { StakeholdernoteSchema } from "../schema"

export default resolver.pipe(
  resolver.zod(StakeholdernoteSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async (input) => {
    return await db.stakeholdernote.create({ data: input })
  },
)
