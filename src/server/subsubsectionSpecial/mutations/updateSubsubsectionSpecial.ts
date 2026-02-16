import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { SubsubsectionSpecial } from "@/src/server/subsubsectionSpecial/schema"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const UpdateSubsubsectionSpecialSchema = ProjectSlugRequiredSchema.merge(
  SubsubsectionSpecial.merge(z.object({ id: z.number() })),
)

export default resolver.pipe(
  resolver.zod(UpdateSubsubsectionSpecialSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug, ...data }) => {
    return await db.subsubsectionSpecial.update({
      where: { id },
      data,
    })
  },
)
