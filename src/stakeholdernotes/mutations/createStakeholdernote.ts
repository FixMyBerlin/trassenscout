import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { StakeholdernoteSchema } from "../schema"

const CreateStakeholdernoteSchema = ProjectSlugRequiredSchema.merge(StakeholdernoteSchema)

export default resolver.pipe(
  resolver.zod(CreateStakeholdernoteSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...data }) => {
    return await db.stakeholdernote.create({ data })
  },
)
