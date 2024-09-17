import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import getProjectIdBySlug from "../queries/getProjectIdBySlug"
import { ProjectSchema } from "../schema"

const UpdateProject = ProjectSchema.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateProject),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ id, ...data }) => {
    return await db.project.update({ where: { id }, data })
  },
)
