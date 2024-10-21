import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { SubsubsectionSpecial } from "../schema"

const UpdateSubsubsectionSpecialSchema = ProjectSlugRequiredSchema.merge(
  SubsubsectionSpecial.merge(z.object({ id: z.number() })),
)

export default resolver.pipe(
  resolver.zod(UpdateSubsubsectionSpecialSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, ...data }) => {
    return await db.subsubsectionSpecial.update({
      where: { id },
      data,
    })
  },
)
