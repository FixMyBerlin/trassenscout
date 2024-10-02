import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const DeleteSubsubsectionInfraSchema = ProjectSlugRequiredSchema.merge(z.object({ id: z.number() }))

export default resolver.pipe(
  resolver.zod(DeleteSubsubsectionInfraSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id }) => {
    return await db.subsubsectionInfra.deleteMany({ where: { id } })
  },
)
