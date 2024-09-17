import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import getSubsubsectionProjectId from "../queries/getSubsubsectionProjectId"

const DeleteSubsubsection = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteSubsubsection),
  authorizeProjectAdmin(getSubsubsectionProjectId),
  async ({ id }) => await db.subsubsection.deleteMany({ where: { id } }),
)
