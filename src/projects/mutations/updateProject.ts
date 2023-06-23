import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { ProjectSchema } from "../schema"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "../queries/getProjectIdBySlug"

const UpdateProject = ProjectSchema.merge(
  z.object({
    id: z.number(),
  })
)

export default resolver.pipe(
  resolver.zod(UpdateProject),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ id, ...data }) => {
    return await db.project.update({ where: { id }, data })
  }
)
