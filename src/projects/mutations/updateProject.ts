import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { ProjectSchema } from "../schema"

const UpdateProject = ProjectSchema.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateProject),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, ...data }) => {
    return await db.project.update({ where: { id }, data })
  },
)
