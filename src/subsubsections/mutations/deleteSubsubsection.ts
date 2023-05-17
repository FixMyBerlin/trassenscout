import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
import getSubsubsectionProjectId from "../queries/getSubsubsectionProjectId"

const DeleteSubsubsection = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteSubsubsection),
  authorizeProjectAdmin(getSubsubsectionProjectId),
  async ({ id }) => await db.subsubsection.deleteMany({ where: { id } })
)
