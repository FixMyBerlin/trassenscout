import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug"
import { QualityLevelSchema } from "@/src/server/qualityLevels/schema"
import { resolver } from "@blitzjs/rpc"

const CreateQualityLevelSchema = ProjectSlugRequiredSchema.merge(
  QualityLevelSchema.omit({ projectId: true }),
)

export default resolver.pipe(
  resolver.zod(CreateQualityLevelSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }) => {
    return await db.qualityLevel.create({
      data: {
        ...input,
        projectId: await getProjectIdBySlug(projectSlug),
      },
    })
  },
)
