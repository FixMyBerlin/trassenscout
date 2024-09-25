import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import getSubsubsectionTaskProjectId from "../queries/getSubsubsectionTaskProjectId"

const DeleteSubsubsectionTaskSchema = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteSubsubsectionTaskSchema),
  authorizeProjectAdmin(getSubsubsectionTaskProjectId),
  async ({ id }) => await db.subsubsectionTask.deleteMany({ where: { id } }),
)
