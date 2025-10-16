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
import { SubsectionStatus } from "../schema"

const UpdateSubsectionStatusSchema = ProjectSlugRequiredSchema.merge(
  SubsectionStatus.omit({ projectId: true }).merge(z.object({ id: z.number() })),
)

export default resolver.pipe(
  resolver.zod(UpdateSubsectionStatusSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug, ...data }) =>
    await db.subsectionStatus.update({
      where: { id },
      data: { ...data, projectId: await getProjectIdBySlug(projectSlug) },
    }),
)
