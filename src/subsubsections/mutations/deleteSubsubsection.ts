import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteSubsubsection = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteSubsubsection),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const subsubsection = await db.subsubsection.deleteMany({ where: { id } })

    return subsubsection
  }
)
