import { resolver } from "@blitzjs/rpc"
import db from "db"
import { FileSchema } from "../schema"

export default resolver.pipe(resolver.zod(FileSchema), resolver.authorize(), async (input) => {
  const file = await db.file.create({ data: input })

  return file
})
