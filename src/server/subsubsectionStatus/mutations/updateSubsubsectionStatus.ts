import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import getProjectIdBySlug from "@/src/server/projects/queries/getProjectIdBySlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { SubsubsectionStatus } from "../schema"

const UpdateSubsubsectionStatusSchema = ProjectSlugRequiredSchema.merge(
  SubsubsectionStatus.omit({ projectId: true }).merge(z.object({ id: z.number() })),
)

export default resolver.pipe(
  resolver.zod(UpdateSubsubsectionStatusSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug, ...data }) =>
    await db.subsubsectionStatus.update({
      where: { id },
      data: { ...data, projectId: await getProjectIdBySlug(projectSlug) },
    }),
)
