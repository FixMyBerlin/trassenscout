import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getSectionProjectId from "src/sections/queries/getSectionProjectId"
import { z } from "zod"

const DeleteSubsubsection = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteSubsubsection),
  authorizeProjectAdmin(getSectionProjectId),
  async ({ id }) => await db.subsubsection.deleteMany({ where: { id } })
)
