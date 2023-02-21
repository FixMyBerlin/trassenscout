import { resolver } from "@blitzjs/rpc"
import db from "db"

import { z } from "zod"
import { FileSchema } from "../schema"
import { authorizeProjectAdmin } from "src/authorization"

const UpdateFileSchema = FileSchema.merge(
  z.object({
    id: z.number(),
    projectSlug: z.string(),
  })
)

export default resolver.pipe(
  resolver.zod(UpdateFileSchema),
  authorizeProjectAdmin,
  async ({ id, ...data }) => {
    const file = await db.file.update({ where: { id }, data })

    return file
  }
)
