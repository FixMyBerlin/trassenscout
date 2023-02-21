import { resolver } from "@blitzjs/rpc"
import db from "db"

import { z } from "zod"
import { authorizeProjectAdmin } from "src/authorization"

const DeleteFile = z.object({
  id: z.number(),
  projectSlug: z.string(),
})

export default resolver.pipe(resolver.zod(DeleteFile), authorizeProjectAdmin(), async ({ id }) => {
  return await db.file.deleteMany({ where: { id } })
})
