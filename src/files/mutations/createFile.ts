import { resolver } from "@blitzjs/rpc"
import db from "db"
import { FileSchema } from "../schema"

export default resolver.pipe(resolver.zod(FileSchema), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const file = await db.file.create({ data: input })

  return file
})
