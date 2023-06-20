import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import getSubsectionProjectId from "../queries/getSubsectionProjectId"

const DeleteSubsectionSchema = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteSubsectionSchema),
  authorizeProjectAdmin(getSubsectionProjectId),
  async ({ id }) => await db.subsection.deleteMany({ where: { id } })
)
