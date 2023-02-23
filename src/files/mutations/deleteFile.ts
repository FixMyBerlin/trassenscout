import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
import getFileProjectId from "../queries/getFileProjectId"

const DeleteFileSchema = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteFileSchema),
  authorizeProjectAdmin(getFileProjectId),
  async ({ id }) => await db.file.deleteMany({ where: { id } })
)
