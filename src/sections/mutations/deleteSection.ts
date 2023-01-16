import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteSection = z.object({
  id: z.number(),
})

export default resolver.pipe(resolver.zod(DeleteSection), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const section = await db.section.deleteMany({ where: { id } })

  return section
})
