import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { SubsubsectionStatus } from "@/src/server/subsubsectionStatus/schema"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const UpdateSubsubsectionStatusSchema = ProjectSlugRequiredSchema.merge(
  SubsubsectionStatus.omit({ projectId: true }).merge(z.object({ id: z.number() })),
)

export default resolver.pipe(
  resolver.zod(UpdateSubsubsectionStatusSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug, ...data }) =>
    await db.subsubsectionStatus.update({
      where: { id },
      data,
    }),
)
