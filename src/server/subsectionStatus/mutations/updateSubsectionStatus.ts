import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { SubsectionStatus } from "@/src/server/subsectionStatus/schema"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const UpdateSubsectionStatusSchema = ProjectSlugRequiredSchema.merge(
  SubsectionStatus.merge(z.object({ id: z.number() })),
)

export default resolver.pipe(
  resolver.zod(UpdateSubsectionStatusSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug, ...data }) =>
    await db.subsectionStatus.update({
      where: { id },
      data,
    }),
)
