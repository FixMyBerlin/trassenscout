import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { SubsubsectionInfra } from "../schema"

const UpdateSubsubsectionInfraSchema = ProjectSlugRequiredSchema.merge(
  SubsubsectionInfra.merge(z.object({ id: z.number() })),
)

export default resolver.pipe(
  resolver.zod(UpdateSubsubsectionInfraSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, ...data }) => {
    return await db.subsubsectionInfra.update({
      where: { id },
      data,
    })
  },
)
