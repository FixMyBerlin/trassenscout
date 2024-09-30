import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { getProjectIdBySlug } from "@/src/projects/queries/getProjectIdBySlug"
import { resolver } from "@blitzjs/rpc"
import { SubsubsectionTask } from "../schema"

const CreateSubsubsectionTaskSchema = ProjectSlugRequiredSchema.merge(
  SubsubsectionTask.omit({ projectId: true }),
)

export default resolver.pipe(
  resolver.zod(CreateSubsubsectionTaskSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }) => {
    return await db.subsubsectionTask.create({
      data: {
        ...input,
        projectId: await getProjectIdBySlug(projectSlug),
      },
    })
  },
)
