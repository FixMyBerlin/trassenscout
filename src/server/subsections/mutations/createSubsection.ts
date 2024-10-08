import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { SubsectionSchema } from "../schema"

const CreateSubsectionSchema = ProjectSlugRequiredSchema.merge(SubsectionSchema)

export default resolver.pipe(
  resolver.zod(CreateSubsectionSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...data }) => {
    return await db.subsection.create({ data })
  },
)
