import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import getQualityLevelProjectId from "../queries/getSubsubsectionTaskProjectId"
import { SubsubsectionTask } from "../schema"

const UpdateSubsubsectionTaskSchema = SubsubsectionTask.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateSubsubsectionTaskSchema),
  authorizeProjectAdmin(getQualityLevelProjectId),
  async ({ id, ...data }) =>
    await db.subsubsectionTask.update({
      where: { id },
      data,
    }),
)
