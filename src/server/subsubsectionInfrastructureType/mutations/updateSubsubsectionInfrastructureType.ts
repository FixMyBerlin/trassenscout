import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { SubsubsectionInfrastructureType } from "@/src/server/subsubsectionInfrastructureType/schema"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const UpdateSubsubsectionInfrastructureTypeSchema = ProjectSlugRequiredSchema.merge(
  SubsubsectionInfrastructureType.omit({ projectId: true }).merge(z.object({ id: z.number() })),
)

export default resolver.pipe(
  resolver.zod(UpdateSubsubsectionInfrastructureTypeSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug, ...data }) =>
    await db.subsubsectionInfrastructureType.update({
      where: { id },
      data,
    }),
)
