import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { getProjectIdBySlug } from "@/src/projects/queries/getProjectIdBySlug"
import { resolver } from "@blitzjs/rpc"
import { OperatorSchema } from "../schema"

const CreateOperatorSchema = ProjectSlugRequiredSchema.merge(
  OperatorSchema.omit({ projectId: true }),
)

export default resolver.pipe(
  resolver.zod(CreateOperatorSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }) => {
    return await db.operator.create({
      data: {
        ...input,
        projectId: await getProjectIdBySlug(projectSlug),
      },
    })
  },
)
