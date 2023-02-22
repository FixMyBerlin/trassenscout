import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
import getSectionProjectId from "../queries/getSectionProjectId"

const DeleteSectionSchema = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteSectionSchema),
  authorizeProjectAdmin(getSectionProjectId),
  async ({ id }) => await db.section.deleteMany({ where: { id } })
)
