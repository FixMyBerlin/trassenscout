import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { FileSchema } from "../schema"

const UpdateFileSchema = FileSchema.merge(
  z.object({
    id: z.number(),
  })
)

export default resolver.pipe(
  resolver.zod(UpdateFileSchema),
  resolver.authorize(),
  async ({ id, ...data }) => {
    const file = await db.file.update({ where: { id }, data })

    return file
  }
)
