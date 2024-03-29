import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import getSubsubsectionStatusProjectId from "../queries/getSubsubsectionStatusProjectId"

const DeleteSubsubsectionStatusSchema = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteSubsubsectionStatusSchema),
  authorizeProjectAdmin(getSubsubsectionStatusProjectId),
  async ({ id }) => await db.subsubsectionStatus.deleteMany({ where: { id } }),
)
