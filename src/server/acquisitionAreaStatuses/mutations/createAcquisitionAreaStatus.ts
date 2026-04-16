import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { AcquisitionAreaStatus } from "@/src/server/acquisitionAreaStatuses/schema"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug"
import { resolver } from "@blitzjs/rpc"

const CreateAcquisitionAreaStatusSchema = ProjectSlugRequiredSchema.merge(
  AcquisitionAreaStatus.omit({ projectId: true }),
)

export default resolver.pipe(
  resolver.zod(CreateAcquisitionAreaStatusSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }) => {
    return await db.acquisitionAreaStatus.create({
      data: {
        ...input,
        projectId: await getProjectIdBySlug(projectSlug),
      },
    })
  },
)
