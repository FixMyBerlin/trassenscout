import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import getSubsubsectionSpecialProjectId from "../queries/getSubsubsectionSpecialProjectId"

const DeleteSubsubsectionSpecialSchema = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteSubsubsectionSpecialSchema),
  authorizeProjectAdmin(getSubsubsectionSpecialProjectId),
  async ({ id }) => await db.subsubsectionSpecial.deleteMany({ where: { id } }),
)
